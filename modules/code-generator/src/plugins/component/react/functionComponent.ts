import changeCase from 'change-case';
import {
  COMMON_CHUNK_NAME,
  DEFAULT_LINK_AFTER,
} from '../../../const/generator';
import { ensureValidClassName } from '../../../utils/validate';
import {
  BuilderComponentPlugin,
  BuilderComponentPluginFactory,
  ChunkType,
  FileType,
  ICodeStruct,
  IContainerInfo,
} from '../../../types';
import { REACT_FC_CHUNK_NAME } from './fcConst';

const pluginFactory: BuilderComponentPluginFactory<unknown> = () => {
  const plugin: BuilderComponentPlugin = async (pre: ICodeStruct) => {
    const next: ICodeStruct = { ...pre };
    const ir = next.ir as IContainerInfo;
    const componentName = ensureValidClassName(changeCase.pascalCase(ir.moduleName));

    next.chunks.push({
      type: ChunkType.STRING,
      fileType: FileType.JSX,
      name: REACT_FC_CHUNK_NAME.FunctionComponentDefineStart,
      content: `function ${componentName}(props) {`,
      linkAfter: [
        COMMON_CHUNK_NAME.ExternalDepsImport,
        COMMON_CHUNK_NAME.InternalDepsImport,
        COMMON_CHUNK_NAME.ImportAliasDefine,
        COMMON_CHUNK_NAME.FileVarDefine,
        COMMON_CHUNK_NAME.FileUtilDefine,
      ],
    });

    next.chunks.push({
      type: ChunkType.STRING,
      fileType: FileType.JSX,
      name: REACT_FC_CHUNK_NAME.FunctionComponentDefineEnd,
      content: `}`,
      linkAfter: [
        REACT_FC_CHUNK_NAME.FunctionComponentDefineStart,
        REACT_FC_CHUNK_NAME.FunctionComponentRender,
      ],
    });

    next.chunks.push({
      type: ChunkType.STRING,
      fileType: FileType.JSX,
      name: COMMON_CHUNK_NAME.FileExport,
      content: `export default ${componentName};`,
      linkAfter: [
        COMMON_CHUNK_NAME.ExternalDepsImport,
        COMMON_CHUNK_NAME.InternalDepsImport,
        COMMON_CHUNK_NAME.ImportAliasDefine,
        COMMON_CHUNK_NAME.FileVarDefine,
        COMMON_CHUNK_NAME.FileUtilDefine,
        REACT_FC_CHUNK_NAME.FunctionComponentDefineEnd,
      ],
    });

    return next;
  };
  return plugin;
};

export default pluginFactory;
