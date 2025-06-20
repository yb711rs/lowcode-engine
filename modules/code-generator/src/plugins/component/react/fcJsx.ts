import {
  BuilderComponentPlugin,
  BuilderComponentPluginFactory,
  ChunkType,
  FileType,
  HandlerSet,
  ICodeStruct,
  IContainerInfo,
  IScope,
  NodeGeneratorConfig,
} from '../../../types';
import { COMMON_CHUNK_NAME } from '../../../const/generator';
import { REACT_FC_CHUNK_NAME } from './fcConst';
import { createReactNodeGenerator } from '../../../utils/nodeToJSX';
import { Scope } from '../../../utils/Scope';
import { IPublicTypeJSExpression } from '@alilc/lowcode-types';
import { generateExpression } from '../../../utils/jsExpression';
import { transformJsExpr } from '../../../core/jsx/handlers/transformJsExpression';
import { generateCompositeType } from '../../../utils/compositeType';

export interface PluginConfig {
  fileType?: string;
  nodeTypeMapping?: Record<string, string>;
}

const pluginFactory: BuilderComponentPluginFactory<PluginConfig> = (config?) => {
  const cfg = {
    fileType: FileType.JSX,
    nodeTypeMapping: {} as Record<string, string>,
    ...config,
  };

  const { nodeTypeMapping } = cfg;

  const plugin: BuilderComponentPlugin = async (pre: ICodeStruct) => {
    const next: ICodeStruct = { ...pre };
    const { tolerateEvalErrors = true, evalErrorsHandler = '' } = next.contextData;

    const customHandlers: HandlerSet<string> = {
      expression(input: IPublicTypeJSExpression, scope: IScope, config) {
        return transformJsExpr(generateExpression(input, scope), scope, {
          dontWrapEval: !(config?.tolerateEvalErrors ?? tolerateEvalErrors),
          dontTransformThis2ContextAtRootScope: true,
        });
      },
      function(input, scope: IScope) {
        return generateCompositeType(
          {
            type: 'JSFunction',
            value: input.value || 'function () {}',
          },
          Scope.createRootScope(),
        );
      },
    };

    const generatorPlugins: NodeGeneratorConfig = {
      handlers: customHandlers,
      tagMapping: (v) => nodeTypeMapping[v] || v,
      tolerateEvalErrors,
    };

    const generator = createReactNodeGenerator(generatorPlugins);

    const ir = next.ir as IContainerInfo;
    const scope: IScope = Scope.createRootScope();
    const jsxContent = generator(ir, scope);

    next.chunks.push({
      type: ChunkType.STRING,
      fileType: cfg.fileType,
      name: REACT_FC_CHUNK_NAME.FunctionComponentRender,
      content: `return ${jsxContent};`,
      linkAfter: [REACT_FC_CHUNK_NAME.FunctionComponentDefineStart],
    });

    next.chunks.push({
      type: ChunkType.STRING,
      fileType: cfg.fileType,
      name: COMMON_CHUNK_NAME.CustomContent,
      content: [
        tolerateEvalErrors &&
          `function __$$eval(expr){try{return expr();}catch(e){${evalErrorsHandler}}}`,
        `function __$$evalArray(expr){const res=__$$eval(expr);return Array.isArray(res)?res:[];}`,
      ]
        .filter(Boolean)
        .join('\n'),
      linkAfter: [COMMON_CHUNK_NAME.FileExport],
    });

    return next;
  };
  return plugin;
};

export default pluginFactory;
