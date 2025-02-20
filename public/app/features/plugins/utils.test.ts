import { Location as HistoryLocation } from 'history';

import { NavIndex, NavModelItem } from '@grafana/data';
import { config } from '@grafana/runtime';

import { buildPluginSectionNav } from './utils';

describe('buildPluginSectionNav', () => {
  const pluginNav = { main: { text: 'Plugin nav' }, node: { text: 'Plugin nav' } };
  const app1: NavModelItem = {
    text: 'App1',
    id: 'plugin-page-app1',
    children: [
      {
        text: 'page1',
        url: '/a/plugin1/page1',
      },
      {
        text: 'page2',
        url: '/a/plugin1/page2',
      },
    ],
  };

  const appsSection = {
    text: 'apps',
    id: 'apps',
    children: [app1],
  };

  const adminSection: NavModelItem = {
    text: 'Admin',
    id: 'admin',
    children: [],
  };

  const standalonePluginPage = {
    id: 'standalone-plugin-page-/a/app2/config',
    text: 'Standalone page',
    parentItem: adminSection,
  };

  adminSection.children = [standalonePluginPage];

  app1.parentItem = appsSection;

  const navIndex: NavIndex = {
    apps: appsSection,
    [app1.id!]: appsSection.children[0],
    [standalonePluginPage.id]: standalonePluginPage,
  };

  it('Should return pluginNav if topnav is disabled', () => {
    config.featureToggles.topnav = false;
    const result = buildPluginSectionNav({} as HistoryLocation, pluginNav, {}, 'app1');
    expect(result).toBe(pluginNav);
  });

  it('Should return return section nav if topnav is enabled', () => {
    config.featureToggles.topnav = true;
    const result = buildPluginSectionNav({} as HistoryLocation, pluginNav, navIndex, 'app1');
    expect(result?.main.text).toBe('apps');
  });

  it('Should set active page', () => {
    config.featureToggles.topnav = true;
    const result = buildPluginSectionNav(
      { pathname: '/a/plugin1/page2', search: '' } as HistoryLocation,
      null,
      navIndex,
      'app1'
    );
    expect(result?.main.children![0].children![1].active).toBe(true);
    expect(result?.node.text).toBe('page2');
  });

  it('Should handle standalone page', () => {
    config.featureToggles.topnav = true;
    const result = buildPluginSectionNav(
      { pathname: '/a/app2/config', search: '' } as HistoryLocation,
      pluginNav,
      navIndex,
      'app2'
    );
    expect(result?.main.text).toBe('Admin');
    expect(result?.node.text).toBe('Standalone page');
  });

  it('Should throw error if app not found in navtree', () => {
    config.featureToggles.topnav = true;
    const action = () => {
      buildPluginSectionNav({} as HistoryLocation, pluginNav, navIndex, 'app3');
    };
    expect(action).toThrowError();
  });

  it('Should throw error if app has no section', () => {
    config.featureToggles.topnav = true;
    app1.parentItem = undefined;
    const action = () => {
      buildPluginSectionNav({} as HistoryLocation, pluginNav, navIndex, 'app1');
    };
    expect(action).toThrowError();
  });
});
