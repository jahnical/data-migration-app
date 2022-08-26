import { DIMENSION_ID_EVENT_DATE } from '../../../src/modules/dimensionConstants.js'
import {
    ANALYTICS_PROGRAM,
    TEST_DIM_YESNO,
    TEST_DIM_YESONLY,
    TEST_REL_PE_THIS_YEAR,
} from '../../data/index.js'
import { selectEventProgramDimensions } from '../../helpers/dimensions.js'
import {
    assertChipContainsText,
    assertTooltipContainsEntries,
} from '../../helpers/layout.js'
import { clickMenubarUpdateButton } from '../../helpers/menubar.js'
import {
    selectRelativePeriod,
    getCurrentYearStr,
} from '../../helpers/period.js'
import {
    expectTableToBeVisible,
    expectTableToMatchRows,
} from '../../helpers/table.js'
import { EXTENDED_TIMEOUT } from '../../support/util.js'

const currentYear = getCurrentYearStr()

const event = ANALYTICS_PROGRAM
const periodLabel = event[DIMENSION_ID_EVENT_DATE]
const stageName = 'Stage 1 - Repeatable'

const setUpTable = (dimensionName) => {
    selectEventProgramDimensions({ ...event, dimensions: [dimensionName] })

    selectRelativePeriod({
        label: periodLabel,
        period: TEST_REL_PE_THIS_YEAR,
    })

    clickMenubarUpdateButton()

    expectTableToBeVisible()
}

const addConditions = (conditions, dimensionName) => {
    cy.getBySelLike('layout-chip').contains(dimensionName).click()
    conditions.forEach((conditionName) => {
        cy.getBySel('conditions-modal-content')
            .findBySel('dhis2-uicore-checkbox')
            .contains(conditionName)
            .click()
    })
    cy.getBySel('conditions-modal').contains('Update').click()
}

describe('boolean conditions - Yes/NA', () => {
    const dimensionName = TEST_DIM_YESONLY

    beforeEach(() => {
        cy.visit('/', EXTENDED_TIMEOUT)
        setUpTable(dimensionName)
    })

    it('Yes selected', () => {
        addConditions(['Yes'], dimensionName)

        expectTableToMatchRows([`${currentYear}-01-01`])

        assertChipContainsText(`${dimensionName}: 1 condition`)

        assertTooltipContainsEntries([stageName, /\bYes\b/])
    })

    it('Not answered selected', () => {
        addConditions(['Not answered'], dimensionName)

        expectTableToMatchRows([
            `${currentYear}-01-01`,
            `${currentYear}-01-03`,
            `${currentYear}-02-01`,
            `${currentYear}-03-01`,
            `${currentYear}-04-19`,
        ])

        assertChipContainsText(`${dimensionName}: 1 condition`)

        assertTooltipContainsEntries([stageName, /\bNot answered\b/])
    })

    it('Yes + Not answered selected', () => {
        addConditions(['Yes', 'Not answered'], dimensionName)

        expectTableToMatchRows([
            `${currentYear}-01-01`,
            `${currentYear}-01-03`,
            `${currentYear}-02-01`,
            `${currentYear}-03-01`,
            `${currentYear}-04-19`,
            `${currentYear}-01-01`,
        ])

        assertChipContainsText(`${dimensionName}: all`)

        assertTooltipContainsEntries([stageName, /\bYes\b/, /\bNot answered\b/])
    })
})

describe('boolean conditions - Yes/No/NA', () => {
    const dimensionName = TEST_DIM_YESNO

    beforeEach(() => {
        cy.visit('/', EXTENDED_TIMEOUT)
        setUpTable(dimensionName)
    })

    it('Yes selected', () => {
        addConditions(['Yes'], dimensionName)

        expectTableToMatchRows([`${currentYear}-01-01`, `${currentYear}-04-19`])

        assertChipContainsText(`${dimensionName}: 1 condition`)

        assertTooltipContainsEntries([stageName, /\bYes\b/])
    })

    it('No selected', () => {
        addConditions(['No'], dimensionName)

        expectTableToMatchRows([`${currentYear}-01-03`])

        assertChipContainsText(`${dimensionName}: 1 condition`)

        assertTooltipContainsEntries([stageName, /\bNo\b/])
    })

    it('Yes + Not answered selected', () => {
        addConditions(['Yes', 'Not answered'], dimensionName)

        expectTableToMatchRows([
            `${currentYear}-01-01`,
            `${currentYear}-03-01`,
            `${currentYear}-01-01`,
            `${currentYear}-02-01`,
            `${currentYear}-04-19`,
        ])

        assertChipContainsText(`${dimensionName}: 2 conditions`)

        assertTooltipContainsEntries([stageName, /\bYes\b/, /\bNot answered\b/])
    })

    it('Yes + No + Not answered selected', () => {
        addConditions(['Yes', 'No', 'Not answered'], dimensionName)

        expectTableToMatchRows([
            `${currentYear}-01-01`,
            `${currentYear}-03-01`,
            `${currentYear}-01-01`,
            `${currentYear}-02-01`,
            `${currentYear}-04-19`,
            `${currentYear}-01-03`,
        ])

        assertChipContainsText(`${dimensionName}: all`)

        assertTooltipContainsEntries([
            stageName,
            /\bYes\b/,
            /\bNo\b/,
            /\bNot answered\b/,
        ])
    })
})
