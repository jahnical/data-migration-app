import i18n from '@dhis2/d2-i18n'
import { Button, IconInfo16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { connect } from 'react-redux'
import { tSetCurrentFromUi } from '../../../actions/current'
import { tSetUiConditionsByDimension } from '../../../actions/ui'
import {
    parseConditionsArrayToString,
    parseConditionsStringToArray,
} from '../../../modules/conditions'
import { sGetLegendSetIdByDimensionId } from '../../../reducers/current'
import { sGetLegendSetById } from '../../../reducers/legendSets'
import { sGetMetadata } from '../../../reducers/metadata'
import {
    sGetDimensionIdsFromLayout,
    sGetUiConditionsByDimension,
} from '../../../reducers/ui'
import DimensionModal from '../DimensionModal'
import NumericCondition from './NumericCondition'
import classes from './styles/ConditionsManager.module.css'

const ConditionsManager = ({
    conditions,
    isInLayout,
    onUpdate,
    dimension,
    onClose,
    setConditionsByDimension,
    legendSet,
}) => {
    const [conditionsList, setConditionsList] = useState(
        parseConditionsStringToArray(conditions)
    )

    const addCondition = () => setConditionsList([...conditionsList, ''])

    const removeCondition = conditionIndex =>
        setConditionsList(
            conditionsList.filter((_, index) => index !== conditionIndex)
        )

    const setCondition = (conditionIndex, value) =>
        setConditionsList(
            conditionsList.map((condition, index) =>
                index === conditionIndex ? value : condition
            )
        )

    const storeConditions = () =>
        setConditionsByDimension(
            parseConditionsArrayToString(
                conditionsList.filter(
                    cnd => cnd.length && cnd.slice(-1) !== ':'
                )
            ),
            dimension.id
        )

    const primaryOnClick = () => {
        storeConditions()
        onUpdate()
        onClose()
    }

    const closeModal = () => {
        storeConditions()
        onClose()
    }

    return dimension ? (
        <DimensionModal
            dataTest={'dialog-manager-modal'}
            isInLayout={isInLayout}
            onClose={closeModal}
            onUpdate={primaryOnClick}
            title={dimension.name}
        >
            <div>
                <p className={classes.paragraph}>
                    {i18n.t(
                        'Show items that meet the following conditions for this data item:'
                    )}
                </p>
            </div>
            <div className={classes.mainSection}>
                {!conditionsList.length ? (
                    <p className={classes.paragraph}>
                        <span className={classes.infoIcon}>
                            <IconInfo16 />
                        </span>
                        {i18n.t(
                            'No conditions yet, so all values will be included. Add a condition to filter results.'
                        )}
                    </p>
                ) : (
                    conditionsList.map((condition, index) => (
                        <div key={index}>
                            <NumericCondition
                                condition={condition}
                                onChange={value => setCondition(index, value)}
                                onRemove={() => removeCondition(index)}
                                legendSet={legendSet}
                            />
                            {conditionsList.length > 1 &&
                                index < conditionsList.length - 1 && (
                                    <span className={classes.separator}>
                                        {i18n.t('and')}
                                    </span>
                                )}
                        </div>
                    ))
                )}
                <Button
                    type="button"
                    small
                    onClick={addCondition}
                    dataTest={'conditions-manager-add-condition'}
                    className={classes.addConditionButton}
                >
                    {conditionsList.length
                        ? i18n.t('Add another condition')
                        : i18n.t('Add a condition')}
                </Button>
            </div>
        </DimensionModal>
    ) : null
}

ConditionsManager.propTypes = {
    conditions: PropTypes.string.isRequired,
    dimension: PropTypes.object.isRequired,
    /* eslint-disable-next-line react/no-unused-prop-types */
    dimensionId: PropTypes.string.isRequired,
    isInLayout: PropTypes.bool.isRequired,
    legendSet: PropTypes.object,
    setConditionsByDimension: PropTypes.func,
    onClose: PropTypes.func,
    onUpdate: PropTypes.func,
}

const mapStateToProps = (state, ownProps) => ({
    dimension: sGetMetadata(state)[ownProps.dimensionId],
    isInLayout: sGetDimensionIdsFromLayout(state).includes(
        ownProps.dimensionId
    ),
    conditions: sGetUiConditionsByDimension(state, ownProps.dimensionId) || '',
    dimensionIdsInLayout: sGetDimensionIdsFromLayout(state),
    legendSet: sGetLegendSetById(
        state,
        sGetLegendSetIdByDimensionId(state, ownProps.dimensionId)
    ),
})

const mapDispatchToProps = {
    onUpdate: tSetCurrentFromUi,
    setConditionsByDimension: tSetUiConditionsByDimension,
}

export default connect(mapStateToProps, mapDispatchToProps)(ConditionsManager)
