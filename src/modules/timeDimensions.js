import { DIMENSION_TYPE_PERIOD } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import {
    DIMENSION_ID_EVENT_DATE,
    DIMENSION_ID_ENROLLMENT_DATE,
    DIMENSION_ID_INCIDENT_DATE,
    DIMENSION_ID_SCHEDULED_DATE,
} from './dimensionConstants.js'
import { PROGRAM_TYPE_WITH_REGISTRATION } from './programTypes.js'
import { OUTPUT_TYPE_ENROLLMENT, OUTPUT_TYPE_EVENT } from './visualization.js'

const NAME_PARENT_PROPERTY_PROGRAM = 'program'
const NAME_PARENT_PROPERTY_STAGE = 'stage'

export const getTimeDimensions = () => ({
    [DIMENSION_ID_EVENT_DATE]: {
        id: DIMENSION_ID_EVENT_DATE,
        dimensionType: DIMENSION_TYPE_PERIOD,
        name: i18n.t('Event date'),
        nameParentProperty: NAME_PARENT_PROPERTY_STAGE,
        nameProperty: 'displayExecutionDateLabel',
    },
    [DIMENSION_ID_ENROLLMENT_DATE]: {
        id: DIMENSION_ID_ENROLLMENT_DATE,
        dimensionType: DIMENSION_TYPE_PERIOD,
        name: i18n.t('Enrollment date'),
        nameParentProperty: NAME_PARENT_PROPERTY_PROGRAM,
        nameProperty: 'displayEnrollmentDateLabel',
    },
    [DIMENSION_ID_INCIDENT_DATE]: {
        id: DIMENSION_ID_INCIDENT_DATE,
        dimensionType: DIMENSION_TYPE_PERIOD,
        name: i18n.t('Incident date'),
        nameParentProperty: NAME_PARENT_PROPERTY_PROGRAM,
        nameProperty: 'displayIncidentDateLabel',
    },
    [DIMENSION_ID_SCHEDULED_DATE]: {
        id: DIMENSION_ID_SCHEDULED_DATE,
        dimensionType: DIMENSION_TYPE_PERIOD,
        name: i18n.t('Scheduled date'),
        nameParentProperty: NAME_PARENT_PROPERTY_STAGE,
        nameProperty: 'displayDueDateLabel',
    },
})

export const getTimeDimensionName = (dimension, program, stage) => {
    if (!dimension.nameParentProperty || !program) {
        return dimension.name
    }
    const name =
        dimension.nameParentProperty === NAME_PARENT_PROPERTY_PROGRAM
            ? program[dimension.nameProperty]
            : stage?.[dimension.nameProperty]

    return name || dimension.name
}

export const getHiddenTimeDimensions = (inputType, program, stage) => {
    const hiddenDimensions = []
    switch (inputType) {
        case OUTPUT_TYPE_EVENT: {
            if (program?.programType === PROGRAM_TYPE_WITH_REGISTRATION) {
                if (program.displayIncidentDate === false) {
                    hiddenDimensions.push(DIMENSION_ID_INCIDENT_DATE)
                }

                if (stage?.hideDueDate === true) {
                    hiddenDimensions.push(DIMENSION_ID_SCHEDULED_DATE)
                }
            } else {
                hiddenDimensions.push(DIMENSION_ID_ENROLLMENT_DATE)
                hiddenDimensions.push(DIMENSION_ID_INCIDENT_DATE)
                hiddenDimensions.push(DIMENSION_ID_SCHEDULED_DATE)
            }
            return hiddenDimensions
        }
        case OUTPUT_TYPE_ENROLLMENT: {
            hiddenDimensions.push(DIMENSION_ID_EVENT_DATE)
            hiddenDimensions.push(DIMENSION_ID_SCHEDULED_DATE)

            if (!program || program.displayIncidentDate === false) {
                hiddenDimensions.push(DIMENSION_ID_INCIDENT_DATE)
            }
            return hiddenDimensions
        }
        default: {
            return [
                DIMENSION_ID_EVENT_DATE,
                DIMENSION_ID_ENROLLMENT_DATE,
                DIMENSION_ID_SCHEDULED_DATE,
                DIMENSION_ID_INCIDENT_DATE,
            ]
        }
    }
}
