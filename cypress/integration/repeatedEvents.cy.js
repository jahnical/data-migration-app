import {
    DIMENSION_ID_ENROLLMENT_DATE,
    DIMENSION_ID_EVENT_DATE,
} from '../../src/modules/dimensionConstants.js'
import { E2E_PROGRAM, TEST_REL_PE_LAST_YEAR } from '../data/index.js'
import { goToAO } from '../helpers/common.js'
import {
    openDimension,
    selectEnrollmentProgram,
    selectEnrollmentProgramDimensions,
    selectEventWithProgram,
    selectEventWithProgramDimensions,
} from '../helpers/dimensions.js'
import { clickMenubarUpdateButton } from '../helpers/menubar.js'
import { selectRelativePeriod } from '../helpers/period.js'
import { goToStartPage } from '../helpers/startScreen.js'
import {
    getTableHeaderCells,
    expectTableToBeVisible,
    getTableDataCells,
} from '../helpers/table.js'

const getRepeatedEventsTab = () =>
    cy.getBySel('conditions-modal-content').contains('Repeated events')

const setUpTable = ({ enrollment, dimensionName }) => {
    selectEnrollmentProgramDimensions({
        ...enrollment,
        dimensions: [dimensionName],
    })

    selectRelativePeriod({
        label: enrollment[DIMENSION_ID_ENROLLMENT_DATE],
        period: TEST_REL_PE_LAST_YEAR,
    })

    cy.getBySel('columns-axis')
        .findBySel('dimension-menu-button-enrollmentDate')
        .click()
    cy.contains('Move to Filter').click()

    cy.getBySel('columns-axis').findBySel('dimension-menu-button-ou').click()
    cy.contains('Move to Filter').click()

    clickMenubarUpdateButton()

    expectTableToBeVisible()

    cy.getBySelLike('layout-chip').contains(`${dimensionName}: all`)
}

const setRepetition = ({ dimensionName, recent, oldest }) => {
    cy.getBySelLike('layout-chip').contains(dimensionName).click()
    getRepeatedEventsTab().click()
    cy.getBySel('most-recent-input')
        .find('input')
        .type('{backspace}')
        .type('{moveToEnd}')
        .type(recent)
    cy.getBySel('oldest-input')
        .find('input')
        .type('{backspace}')
        .type('{moveToEnd}')
        .type(oldest)
    cy.getBySel('conditions-modal').contains('Update').click()
}

const expectRepetitionToBe = ({ dimensionName, recent, oldest }) => {
    cy.getBySelLike('layout-chip').contains(dimensionName).click()
    getRepeatedEventsTab().click()
    cy.getBySel('most-recent-input')
        .find('input')
        .should('be.visible')
        .and('have.value', recent)
    cy.getBySel('oldest-input')
        .find('input')
        .should('be.visible')
        .and('have.value', oldest)
    cy.getBySel('conditions-modal').contains('Hide').click()
}

const expectHeaderToContainExact = (index, value) =>
    getTableHeaderCells().eq(index).containsExact(value)

describe('repeated events', () => {
    beforeEach(() => {
        goToStartPage()
    })
    it('can use repetition for enrollments', () => {
        const dimensionName = 'E2E - Percentage'
        setUpTable({ enrollment: E2E_PROGRAM, dimensionName })

        // initially only has 1 column and 1 row
        getTableHeaderCells().its('length').should('equal', 1)
        getTableHeaderCells().eq(0).containsExact('E2E - Percentage')
        getTableDataCells().eq(0).invoke('text').should('eq', '46')
        expectRepetitionToBe({ dimensionName, recent: 1, oldest: 0 })

        // repetition 2/0 can be set successfully
        setRepetition({ dimensionName, recent: 2, oldest: 0 })
        let result = ['45', '46']
        result.forEach((value, index) => {
            getTableDataCells().eq(index).invoke('text').should('eq', value)
        })
        expectHeaderToContainExact(
            0,
            'E2E - Percentage - Stage 1 - Repeatable (most recent -1)'
        )
        expectHeaderToContainExact(
            1,
            'E2E - Percentage - Stage 1 - Repeatable (most recent)'
        )

        // repetition 0/2 can be set successfully
        setRepetition({ dimensionName, recent: 0, oldest: 2 })
        result = ['45', '46']
        result.forEach((value, index) => {
            getTableDataCells().eq(index).contains(value)
        })
        expectHeaderToContainExact(
            0,
            'E2E - Percentage - Stage 1 - Repeatable (oldest)'
        )
        expectHeaderToContainExact(
            1,
            'E2E - Percentage - Stage 1 - Repeatable (oldest +1)'
        )

        // repetition 2/2 can be set successfully
        setRepetition({ dimensionName, recent: 2, oldest: 2 })
        result = ['45', '46', '45', '46']
        result.forEach((value, index) => {
            getTableDataCells().eq(index).invoke('text').should('eq', value)
        })
        expectHeaderToContainExact(
            0,
            'E2E - Percentage - Stage 1 - Repeatable (oldest)'
        )
        expectHeaderToContainExact(
            1,
            'E2E - Percentage - Stage 1 - Repeatable (oldest +1)'
        )
        expectHeaderToContainExact(
            2,
            'E2E - Percentage - Stage 1 - Repeatable (most recent -1)'
        )
        expectHeaderToContainExact(
            3,
            'E2E - Percentage - Stage 1 - Repeatable (most recent)'
        )

        // switch back to event, check that repetition is cleared
        selectEventWithProgramDimensions({
            ...E2E_PROGRAM,
            dimensions: [dimensionName],
        })

        selectRelativePeriod({
            label: E2E_PROGRAM[DIMENSION_ID_EVENT_DATE],
            period: TEST_REL_PE_LAST_YEAR,
        })

        clickMenubarUpdateButton()

        expectTableToBeVisible()

        // no repetition in header
        expectHeaderToContainExact(0, dimensionName)
    })
    it('repetition out of bounds returns as empty value', () => {
        const dimensionName = 'E2E - Percentage'
        setUpTable({ enrollment: E2E_PROGRAM, dimensionName })

        // repetition 6/0 can be set successfully
        setRepetition({ dimensionName, recent: 6, oldest: 0 })
        const result = ['', '', '', '', '45', '46']
        result.forEach((value, index) => {
            getTableDataCells().eq(index).invoke('text').should('eq', value)
        })
        expectHeaderToContainExact(
            0,
            'E2E - Percentage - Stage 1 - Repeatable (most recent -5)'
        )
        expectHeaderToContainExact(
            2,
            'E2E - Percentage - Stage 1 - Repeatable (most recent -3)'
        )
        expectHeaderToContainExact(
            5,
            'E2E - Percentage - Stage 1 - Repeatable (most recent)'
        )
    })
    it('repetition is disabled for non repetable stages', () => {
        selectEnrollmentProgram({ programName: 'Child Programme' })

        openDimension('MCH Apgar Score')

        getRepeatedEventsTab()
            .should('have.class', 'disabled')
            .trigger('mouseover')

        cy.getBySelLike('repeatable-events-tooltip-content').contains(
            'Only available for repeatable stages'
        )
    })
    it('repetition is hidden when input = event', () => {
        selectEventWithProgram(E2E_PROGRAM)

        openDimension('E2E - Percentage')

        getRepeatedEventsTab().should('not.exist')
    })
    it('repetition is not disabled after loading a saved vis with cross-stage data element', () => {
        goToAO('WrIV7ZoYECj')

        cy.getBySel('visualization-title').contains(
            'E2E: Enrollment - Hemoglobin (repeated)'
        )

        cy.getBySel('columns-axis').contains('WHOMCH Hemoglobin value').click()

        getRepeatedEventsTab().should('not.have.class', 'disabled')
    })
})
