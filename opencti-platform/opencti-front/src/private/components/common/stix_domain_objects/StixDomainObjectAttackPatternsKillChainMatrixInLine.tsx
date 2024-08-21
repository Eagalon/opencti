import React, { FunctionComponent } from 'react';
import {
  StixDomainObjectAttackPatternsKillChainContainer_data$data,
} from '@components/common/stix_domain_objects/__generated__/StixDomainObjectAttackPatternsKillChainContainer_data.graphql';
import AttackPatternsMatrixLines, { attackPatternsMatrixLinesQuery } from '@components/techniques/attack_patterns/AttackPatternsMatrixLines';
import { NarrativesLinesPaginationQuery$variables } from '@components/techniques/narratives/__generated__/NarrativesLinesPaginationQuery.graphql';
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
import { emptyFilterGroup, useBuildEntityTypeBasedFilterContext } from '../../../../utils/filters/filtersUtils';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import Security from '../../../../utils/Security';
import { KNOWLEDGE_KNPARTICIPATE, KNOWLEDGE_KNUPDATE } from '../../../../utils/hooks/useGranted';
import useHelper from '../../../../utils/hooks/useHelper';

const LOCAL_STORAGE_KEY = 'StixDomainObjectAttackPatternsKillChainMatrixInline';

interface StixDomainObjectAttackPatternsKillChainMatrixProps {
  data: StixDomainObjectAttackPatternsKillChainContainer_data$data;
}

const StixDomainObjectAttackPatternsKillChainMatrixInline: FunctionComponent<StixDomainObjectAttackPatternsKillChainMatrixProps> = (
  {
    data,
  },
) => {
  const { isFeatureEnable } = useHelper();
  const isFABReplaced = isFeatureEnable('FAB_REPLACEMENT');
  const { viewStorage, helpers, paginationOptions } = usePaginationLocalStorage<NarrativesLinesPaginationQuery$variables>(
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
  } = viewStorage;
  const attackPatterns = (data.attackPatterns?.edges ?? []).map((n) => n.node);

  const {
    onToggleEntity,
    numberOfSelectedElements,
    handleClearSelectedElements,
    selectedElements,
    deSelectedElements,
    selectAll,
    handleToggleSelectAll,
  } = useEntityToggle<AttackPatternsMatrixLine_node$data>(LOCAL_STORAGE_KEY);

  const contextFilters = useBuildEntityTypeBasedFilterContext('Attack-Pattern', filters);
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
  console.log('data in StixDomainObjectAttackPatternsKillChainMatrixInline', data);
  console.log('attackPatterns in StixDomainObjectAttackPatternsKillChainMatrixInline', attackPatterns);
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
        iconExtension={true}
        createButton={isFABReplaced && <Security needs={[KNOWLEDGE_KNUPDATE, KNOWLEDGE_KNPARTICIPATE]}>
          <AttackPatternCreation paginationOptions={queryPaginationOptions} />
        </Security>}
      >
        {queryRef && (
        <React.Suspense
          fallback={
            <>
              {Array(20)
                .fill(0)
                .map((_, idx) => (
                  <AttackPatternsMatrixLineDummy key={idx} dataColumns={dataColumns} />
                ))}
            </>
                }
        >
          <AttackPatternsMatrixLines
            attackPatterns={attackPatterns}
            queryRef={queryRef}
            paginationOptions={queryPaginationOptions}
            dataColumns={dataColumns}
            onLabelClick={helpers.handleAddFilter}
            numberOfSelectedElements={numberOfSelectedElements}
            handleClearSelectedElements={handleClearSelectedElements}
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
