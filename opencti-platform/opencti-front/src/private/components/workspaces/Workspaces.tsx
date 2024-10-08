import React, { FunctionComponent } from 'react';
import useHelper from 'src/utils/hooks/useHelper';
import { WorkspacesLinesPaginationQuery, WorkspacesLinesPaginationQuery$variables } from '@components/workspaces/__generated__/WorkspacesLinesPaginationQuery.graphql';
import { WorkspaceLineDummy } from '@components/workspaces/WorkspaceLine';
import ListLines from '../../../components/list_lines/ListLines';
import WorkspacesLines, { workspacesLinesQuery } from './WorkspacesLines';
import WorkspaceCreation from './WorkspaceCreation';
import Security from '../../../utils/Security';
import { EXPLORE_EXUPDATE, INVESTIGATION_INUPDATE } from '../../../utils/hooks/useGranted';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import { GqlFilterGroup } from '../../../utils/filters/filtersUtils';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { useFormatter } from '../../../components/i18n';

interface WorkspacesProps {
  type: string;
}

const Workspaces: FunctionComponent<WorkspacesProps> = ({
  type,
}) => {
  const { t_i18n } = useFormatter();
  const { isFeatureEnable } = useHelper();
  const FAB_REPLACED = isFeatureEnable('FAB_REPLACEMENT');
  const {
    viewStorage,
    paginationOptions,
    helpers: storageHelpers,
  } = usePaginationLocalStorage<WorkspacesLinesPaginationQuery$variables>(
    `view-${type}-list`,
    {
      searchTerm: '',
      sortBy: 'name',
      orderAsc: false,
      openExports: false,
      redirectionMode: 'overview',
      view: 'lines',
    },
  );

  const {
    numberOfElements,
    searchTerm,
    sortBy,
    orderAsc,
  } = viewStorage;

  const filters = {
    mode: 'and',
    filters: [{
      key: ['type'],
      values: [type],
      mode: 'or',
      operator: 'eq',
    }],
    filterGroups: [],
  } as GqlFilterGroup;
  const workspacePaginationOptions = { ...paginationOptions, filters };

  const queryRef = useQueryLoading<WorkspacesLinesPaginationQuery>(
    workspacesLinesQuery,
    workspacePaginationOptions,
  );

  const renderLines = () => {
    const dataColumns = {
      name: {
        label: 'Name',
        width: '30%',
        isSortable: true,
      },
      tags: {
        label: 'Tags',
        width: '20%',
        isSortable: false,
      },
      creator: {
        label: 'Creator',
        width: '10%',
        isSortable: true,
      },
      created_at: {
        label: 'Platform creation date',
        width: '15%',
        isSortable: true,
      },
      updated_at: {
        label: 'Modification date',
        width: '15%',
        isSortable: true,
      },
      ...(type === 'dashboard' ? {
        isShared: {
          id: 'isShared',
          label: 'Shared',
          width: '10%',
          isSortable: false,
        },
      } : {}),
    };

    return (
      <div data-testid="dashboard-page">
        <ListLines
          helpers={storageHelpers}
          sortBy={sortBy}
          orderAsc={orderAsc}
          dataColumns={dataColumns}
          handleSort={storageHelpers.handleSort}
          handleSearch={storageHelpers.handleSearch}
          keyword={searchTerm}
          secondaryAction={true}
          paginationOptions={workspacePaginationOptions}
          numberOfElements={numberOfElements}
          createButton={FAB_REPLACED && <Security needs={[EXPLORE_EXUPDATE]}>
            <WorkspaceCreation
              paginationOptions={workspacePaginationOptions}
              type={type}
            />
          </Security>}
        >
          {queryRef && (
            <React.Suspense
              fallback={
                <>
                  {Array(20)
                    .fill(0)
                    .map((_, idx) => (
                      <WorkspaceLineDummy key={idx} dataColumns={dataColumns} />
                    ))}
                </>
              }
            >
              <WorkspacesLines
                queryRef={queryRef}
                paginationOptions={workspacePaginationOptions}
                dataColumns={dataColumns}
                setNumberOfElements={storageHelpers.handleSetNumberOfElements}
              />
            </React.Suspense>
          )}
        </ListLines>
      </div>
    );
  };

  return (
    <>
      <Breadcrumbs variant="list" elements={type === 'dashboard'
        ? [{ label: t_i18n('Dashboards') }, { label: t_i18n('Custom dashboards'), current: true }]
        : [{ label: t_i18n('Investigations'), current: true }]}
      />
      {renderLines()}
      {!FAB_REPLACED
        && (<Security needs={[EXPLORE_EXUPDATE, INVESTIGATION_INUPDATE]}>
          <WorkspaceCreation
            paginationOptions={workspacePaginationOptions}
            type={type}
          />
          </Security>
        )}
    </>
  );
};

export default Workspaces;
