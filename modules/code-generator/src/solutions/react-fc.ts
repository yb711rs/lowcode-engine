import { IProjectBuilder, IProjectBuilderOptions } from '../types';
import { createProjectBuilder } from '../generator/ProjectBuilder';
import esmodule from '../plugins/common/esmodule';
import styleImport from '../plugins/common/styleImport';
import functionComponent from '../plugins/component/react/functionComponent';
import fcJsx from '../plugins/component/react/fcJsx';
import reactCommonDeps from '../plugins/component/react/reactCommonDeps';
import css from '../plugins/component/style/css';
import constants from '../plugins/project/constants';
import i18n from '../plugins/project/i18n';
import utils from '../plugins/project/utils';
import icejs from '../plugins/project/framework/icejs';
import { prettier } from '../postprocessor';

export type ReactFCProjectBuilderOptions = IProjectBuilderOptions;

export default function createReactFCProjectBuilder(
  options?: ReactFCProjectBuilderOptions,
): IProjectBuilder {
  return createProjectBuilder({
    inStrictMode: options?.inStrictMode,
    extraContextData: { ...options },
    template: icejs.template,
    plugins: {
      components: [
        reactCommonDeps(),
        esmodule({ fileType: 'jsx' }),
        styleImport(),
        functionComponent(),
        fcJsx({ nodeTypeMapping: { Div: 'div', Component: 'div', Page: 'div', Block: 'div' } }),
        css(),
      ],
      pages: [
        reactCommonDeps(),
        esmodule({ fileType: 'jsx' }),
        styleImport(),
        functionComponent(),
        fcJsx({ nodeTypeMapping: { Div: 'div', Component: 'div', Page: 'div', Block: 'div' } }),
        css(),
      ],
      router: [esmodule(), icejs.plugins.router()],
      entry: [icejs.plugins.entry()],
      constants: [constants()],
      utils: [esmodule(), utils('react')],
      i18n: [i18n()],
      globalStyle: [icejs.plugins.globalStyle()],
      htmlEntry: [icejs.plugins.entryHtml()],
      packageJSON: [icejs.plugins.packageJSON()],
    },
    postProcessors: [prettier()],
    customizeBuilderOptions: options?.customizeBuilderOptions,
  });
}

export const plugins = {
  functionComponent,
  fcJsx,
  commonDeps: reactCommonDeps,
};
