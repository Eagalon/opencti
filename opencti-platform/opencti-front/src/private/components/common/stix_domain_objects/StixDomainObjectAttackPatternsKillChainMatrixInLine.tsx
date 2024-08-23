import React, { FunctionComponent } from 'react';
import AttackPatternsMatrixLines, { attackPatternsMatrixLinesQuery } from '@components/techniques/attack_patterns/AttackPatternsMatrixLines';
import ToolBar from '@components/data/ToolBar';
import { AttackPatternsMatrixLineDummy } from '@components/techniques/attack_patterns/AttackPatternsMatrixLine';
import {
  AttackPatternsMatrixLinesPaginationQuery,
  AttackPatternsMatrixLinesPaginationQuery$variables,
} from '@components/techniques/attack_patterns/__generated__/AttackPatternsMatrixLinesPaginationQuery.graphql';
import AttackPatternCreation from '@components/techniques/attack_patterns/AttackPatternCreation';
import { AttackPatternsMatrixLine_node$data } from '@components/techniques/attack_patterns/__generated__/AttackPatternsMatrixLine_node.graphql';
import useEntityToggle from '../../../../utils/hooks/useEntityToggle';
import ListLines from '../../../../components/list_lines/ListLines';
import { usePaginationLocalStorage } from '../../../../utils/hooks/useLocalStorage';
import { emptyFilterGroup, isFilterGroupNotEmpty, useRemoveIdAndIncorrectKeysFromFilterGroupObject } from '../../../../utils/filters/filtersUtils';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import Security from '../../../../utils/Security';
import { KNOWLEDGE_KNPARTICIPATE, KNOWLEDGE_KNUPDATE } from '../../../../utils/hooks/useGranted';
import useHelper from '../../../../utils/hooks/useHelper';

const LOCAL_STORAGE_KEY = 'stixDomainObjectAttackPatternsKillChainMatrixInline';

interface StixDomainObjectAttackPatternsKillChainMatrixProps {
  stixDomainObjectId: string;
}

const StixDomainObjectAttackPatternsKillChainMatrixInline: FunctionComponent<StixDomainObjectAttackPatternsKillChainMatrixProps> = (
  {
    stixDomainObjectId,
  },
) => {
  const { isFeatureEnable } = useHelper();
  const isFABReplaced = isFeatureEnable('FAB_REPLACEMENT');
  const { viewStorage, helpers, paginationOptions } = usePaginationLocalStorage<AttackPatternsMatrixLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    {
      searchTerm: '',
      sortBy: 'name',
      orderAsc: true,
      openExports: false,
      filters: {
        ...emptyFilterGroup,
      },
      view: 'lines',
    },
  );
  const {
    sortBy,
    searchTerm,
    orderAsc,
    filters,
    numberOfElements,
  } = viewStorage;

  const {
    onToggleEntity,
    numberOfSelectedElements,
    handleClearSelectedElements,
    selectedElements,
    deSelectedElements,
    selectAll,
    handleToggleSelectAll,
  } = useEntityToggle<AttackPatternsMatrixLine_node$data>(LOCAL_STORAGE_KEY);

  const userFilters = useRemoveIdAndIncorrectKeysFromFilterGroupObject(filters, ['Attack-Pattern']);
  const contextFilters = {
    mode: 'and',
    filters: [
      { key: 'entity_type', values: ['Attack-Pattern'], mode: 'or', operator: 'eq' },
      {
        key: 'regardingOf',
        values: [
          { key: 'id', values: [stixDomainObjectId] },
        ],
      },
    ],
    filterGroups: userFilters && isFilterGroupNotEmpty(userFilters) ? [userFilters] : [],
  };

  const queryPaginationOptions = {
    ...paginationOptions,
    filters: contextFilters,
  } as unknown as AttackPatternsMatrixLinesPaginationQuery$variables;

  const queryRef = useQueryLoading<AttackPatternsMatrixLinesPaginationQuery>(
    attackPatternsMatrixLinesQuery,
    queryPaginationOptions,
  );
  const dataColumns = {
    killChainPhase: {
      label: 'Kill chain phase',
      width: '25%',
      isSortable: false,
    },
    x_mitre_id: {
      label: 'ID',
      width: '10%',
      isSortable: true,
    },
    name: {
      label: 'Name',
      width: '15%',
      isSortable: true,
    },
    objectLabel: {
      label: 'Labels',
      width: '15%',
      isSortable: false,
    },
    created: {
      label: 'Original creation date',
      width: '20%',
      isSortable: true,
    },
    objectMarking: {
      label: 'Marking',
      width: '15%',
      isSortable: true,
    },
  };

  return (
    <>
      <ListLines
        helpers={helpers}
        sortBy={sortBy}
        orderAsc={orderAsc}
        dataColumns={dataColumns}
        handleToggleSelectAll={handleToggleSelectAll}
        selectAll={selectAll}
        paginationOptions={queryPaginationOptions}
        numberOfElements={numberOfElements}
        iconExtension={true}
        createButton={isFABReplaced && (
        <Security needs={[KNOWLEDGE_KNUPDATE, KNOWLEDGE_KNPARTICIPATE]}>
          <AttackPatternCreation paginationOptions={queryPaginationOptions} />
        </Security>
        )}
      >
        {queryRef && (
        <React.Suspense
          fallback={
            <>
              {Array(20)
                .fill(0)
                .map((_, idx) => (
                  <AttackPatternsMatrixLineDummy
                    key={idx}
                    dataColumns={dataColumns}
                  />
                ))
              }
            </>
          }
        >
          <AttackPatternsMatrixLines
            queryRef={queryRef}
            paginationOptions={queryPaginationOptions}
            dataColumns={dataColumns}
            onLabelClick={helpers.handleAddFilter}
            selectedElements={selectedElements}
            deSelectedElements={deSelectedElements}
            onToggleEntity={onToggleEntity}
            selectAll={selectAll}
            setNumberOfElements={helpers.handleSetNumberOfElements}
          />
        </React.Suspense>
        )}
      </ListLines>
      <ToolBar
        selectedElements={selectedElements}
        deSelectedElements={deSelectedElements}
        numberOfSelectedElements={numberOfSelectedElements}
        selectAll={selectAll}
        search={searchTerm}
        filters={contextFilters}
        handleClearSelectedElements={handleClearSelectedElements}
        type="Attack-Pattern"
      />
    </>
  );
};

export default StixDomainObjectAttackPatternsKillChainMatrixInline;
