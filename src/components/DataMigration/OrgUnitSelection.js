import { useCachedDataQuery } from '@dhis2/analytics'
import { OrganisationUnitTree } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import { acAddMetadata } from '../../actions/metadata.js'
import { migrationActionCreators } from '../../actions/migration.js'
import { acAddParentGraphMap } from '../../actions/ui.js'
import { removeLastPathSegment } from '../../modules/orgUnit.js'
import { sGetMetadata } from '../../reducers/metadata.js'
import { sGetUiParentGraphMap } from '../../reducers/ui.js'

const OrgUnitSelection = ({
    metadata,
    addMetadata,
    addParentGraphMap,
    isSourceOrgUnit,
}) => {
    const { rootOrgUnits } = useCachedDataQuery()
    const [selected, setSelected] = useState({})
    const dispatch = useDispatch()

    const setValues = (item) => {
        console.log(item)
        if (item.checked) {
            const forMetadata = {}
            const forParentGraphMap = {}

            forMetadata[item.id] = {
                id: item.id,
                name: item.name || item.displayName,
                displayName: item.displayName,
            }

            if (item.path) {
                const path = removeLastPathSegment(item.path)

                forParentGraphMap[item.id] =
                    path === `/${item.id}` ? '' : path.replace(/^\//, '')
            }

            addMetadata(forMetadata)
            addParentGraphMap(forParentGraphMap)
            setSelected(item)
            if (isSourceOrgUnit) {
                dispatch(migrationActionCreators.setSourceOrgUnit(item.id))
            } else {
                dispatch(migrationActionCreators.setTargetOrgUnit(item.id))
            }
        }
    }

    console.log(metadata)

    const roots = rootOrgUnits.map((rootOrgUnit) => rootOrgUnit.id)

    console.log(selected)
    return (
        <OrganisationUnitTree
            roots={roots}
            initiallyExpanded={[
                ...(roots.length === 1 ? [`/${roots[0]}`] : []),
                selected?.path?.substring(0, selected.path.lastIndexOf('/')),
            ].filter((path) => path)}
            selected={selected.path && [selected.path]}
            onChange={(item) => setValues(item)}
            dataTest="org-unit-tree"
            singleSelection
        />
    )
}

OrgUnitSelection.propTypes = {
    isSourceOrgUnit: PropTypes.bool.isRequired,
    addMetadata: PropTypes.func,
    addParentGraphMap: PropTypes.func,
    metadata: PropTypes.object,
}

OrgUnitSelection.defaultProps = {
    rootOrgUnits: [],
}

const mapStateToProps = (state) => ({
    metadata: sGetMetadata(state),
    parentGraphMap: sGetUiParentGraphMap(state),
})

export default connect(mapStateToProps, {
    addMetadata: acAddMetadata,
    addParentGraphMap: acAddParentGraphMap,
})(OrgUnitSelection)
