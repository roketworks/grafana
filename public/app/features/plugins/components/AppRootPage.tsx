// Libraries
import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { createHtmlPortalNode, InPortal, OutPortal } from 'react-reverse-portal';
import { createSelector } from 'reselect';

import { AppEvents, AppPlugin, AppPluginMeta, KeyValue, NavModel, PluginType } from '@grafana/data';
import { config } from '@grafana/runtime';
import { getNotFoundNav, getWarningNav, getExceptionNav } from 'app/angular/services/nav_model_srv';
import { Page } from 'app/core/components/Page/Page';
import { PageProps } from 'app/core/components/Page/types';
import PageLoader from 'app/core/components/PageLoader/PageLoader';
import { appEvents } from 'app/core/core';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { StoreState, useSelector } from 'app/types';

import { getPluginSettings } from '../pluginSettings';
import { importAppPlugin } from '../plugin_loader';
import { buildPluginSectionNav } from '../utils';

import { buildPluginPageContext, PluginPageContext } from './PluginPageContext';

interface RouteParams {
  pluginId: string;
}

interface Props extends GrafanaRouteComponentProps<RouteParams> {}

interface State {
  loading: boolean;
  plugin?: AppPlugin | null;
  pluginNav: NavModel | null;
}

const initialState: State = { loading: true, pluginNav: null, plugin: null };

export function AppRootPage({ match, queryParams, location }: Props) {
  const [state, dispatch] = useReducer(stateSlice.reducer, initialState);
  const portalNode = useMemo(() => createHtmlPortalNode(), []);
  const { plugin, loading, pluginNav } = state;
  const sectionNav = useSelector(
    createSelector(getNavIndex, (navIndex) =>
      buildPluginSectionNav(location, pluginNav, navIndex, match.params.pluginId)
    )
  );
  const context = useMemo(() => buildPluginPageContext(sectionNav), [sectionNav]);

  useEffect(() => {
    loadAppPlugin(match.params.pluginId, dispatch);
  }, [match.params.pluginId]);

  const onNavChanged = useCallback(
    (newPluginNav: NavModel) => dispatch(stateSlice.actions.changeNav(newPluginNav)),
    []
  );

  if (!plugin || match.params.pluginId !== plugin.meta.id) {
    return <Page {...getLoadingPageProps(sectionNav)}>{loading && <PageLoader />}</Page>;
  }

  if (!plugin.root) {
    return (
      <Page navModel={sectionNav ?? getWarningNav('Plugin load error')}>
        <div>No root app page component found</div>;
      </Page>
    );
  }

  const pluginRoot = plugin.root && (
    <plugin.root
      meta={plugin.meta}
      basename={match.url}
      onNavChanged={onNavChanged}
      query={queryParams as KeyValue}
      path={location.pathname}
    />
  );

  if (config.featureToggles.topnav && !pluginNav) {
    return <PluginPageContext.Provider value={context}>{pluginRoot}</PluginPageContext.Provider>;
  }

  return (
    <>
      <InPortal node={portalNode}>{pluginRoot}</InPortal>
      {sectionNav ? (
        <Page navModel={sectionNav} pageNav={pluginNav?.node}>
          <Page.Contents isLoading={loading}>
            <OutPortal node={portalNode} />
          </Page.Contents>
        </Page>
      ) : (
        <Page>
          <OutPortal node={portalNode} />
        </Page>
      )}
    </>
  );
}

const stateSlice = createSlice({
  name: 'prom-builder-container',
  initialState: initialState,
  reducers: {
    setState: (state, action: PayloadAction<Partial<State>>) => {
      Object.assign(state, action.payload);
    },
    changeNav: (state, action: PayloadAction<NavModel>) => {
      let pluginNav = action.payload;
      // This is to hide the double breadcrumbs the old nav model can cause
      if (pluginNav && pluginNav.node.children) {
        pluginNav = {
          ...pluginNav,
          node: {
            ...pluginNav.main,
            hideFromBreadcrumbs: true,
          },
        };
      }
      state.pluginNav = pluginNav;
    },
  },
});

function getLoadingPageProps(sectionNav: NavModel | null): Partial<PageProps> {
  if (config.featureToggles.topnav && sectionNav) {
    return { navModel: sectionNav };
  }

  const loading = { text: 'Loading plugin' };

  return {
    navModel: { main: loading, node: loading },
  };
}

async function loadAppPlugin(pluginId: string, dispatch: React.Dispatch<AnyAction>) {
  try {
    const app = await getPluginSettings(pluginId).then((info) => {
      const error = getAppPluginPageError(info);
      if (error) {
        appEvents.emit(AppEvents.alertError, [error]);
        dispatch(stateSlice.actions.setState({ pluginNav: getWarningNav(error) }));
        return null;
      }
      return importAppPlugin(info);
    });
    dispatch(stateSlice.actions.setState({ plugin: app, loading: false, pluginNav: null }));
  } catch (err) {
    dispatch(
      stateSlice.actions.setState({
        plugin: null,
        loading: false,
        pluginNav: process.env.NODE_ENV === 'development' ? getExceptionNav(err) : getNotFoundNav(),
      })
    );
  }
}

function getNavIndex(store: StoreState) {
  return store.navIndex;
}

export function getAppPluginPageError(meta: AppPluginMeta) {
  if (!meta) {
    return 'Unknown Plugin';
  }
  if (meta.type !== PluginType.app) {
    return 'Plugin must be an app';
  }
  if (!meta.enabled) {
    return 'Application Not Enabled';
  }
  return null;
}

export default AppRootPage;
