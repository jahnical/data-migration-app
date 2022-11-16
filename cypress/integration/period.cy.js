import { clearInput, typeInput } from '../helpers/common.js'
import { getCurrentYearStr, getPreviousYearStr } from '../helpers/period.js'
import { goToStartPage } from '../helpers/startScreen.js'
import { EXTENDED_TIMEOUT } from '../support/util.js'

describe('period dimension', () => {
    const currentYear = getCurrentYearStr()
    const previousYear = getPreviousYearStr()

    const TEST_DIM_ID = 'eventDate'
    const TEST_DIM_NAME = 'Event date'
    const TEST_RELATIVE_PERIOD_NAME = 'Last 3 months'
    const TEST_FIXED_PERIOD_NAME = `January ${currentYear}`

    const openModal = (id) =>
        cy
            .getBySel('main-sidebar', EXTENDED_TIMEOUT)
            .findBySel(`dimension-item-${id}`)
            .click()

    it('opens modal', () => {
        goToStartPage()

        openModal(TEST_DIM_ID)

        cy.getBySel('period-dimension-modal').should('be.visible')
    })
    it('modal has title', () => {
        cy.getBySel('period-dimension-modal-title').should(
            'contain',
            TEST_DIM_NAME
        )
    })
    it('default selection is selected', () => {
        cy.contains('Choose from presets').should('have.class', 'selected')

        cy.getBySel('period-dimension-relative-periods-button').should(
            'have.class',
            'selected'
        )

        cy.getBySelLike(
            'period-dimension-relative-period-filter-content'
        ).should('contain', 'Months')
    })
    it('a relative period can be added', () => {
        cy.getBySelLike('period-dimension-transfer-sourceoptions')
            .contains(TEST_RELATIVE_PERIOD_NAME)
            .dblclick()

        cy.getBySelLike('period-dimension-transfer-pickedoptions').should(
            'contain',
            TEST_RELATIVE_PERIOD_NAME
        )
    })
    it('a fixed period can be added', () => {
        cy.getBySel('period-dimension-fixed-periods-button')
            .click()
            .should('have.class', 'selected')

        cy.getBySelLike(
            'period-dimension-fixed-period-filter-period-type-content'
        ).should('contain', 'Monthly')

        cy.getBySelLike('period-dimension-transfer-sourceoptions')
            .contains(TEST_FIXED_PERIOD_NAME)
            .dblclick()

        cy.getBySelLike('period-dimension-transfer-pickedoptions').should(
            'contain',
            TEST_FIXED_PERIOD_NAME
        )
    })
    it('a custom period can be selected', () => {
        cy.contains('Define start - end dates')
            .click()
            .should('have.class', 'selected')

        typeInput('start-date-input', `${previousYear}-01-01`)
        typeInput('end-date-input', `${currentYear}-12-31`)

        cy.contains('Add to Columns').click()

        cy.getBySelLike('layout-chip')
            .contains(`${TEST_DIM_NAME}: 1 selected`)
            .trigger('mouseover')

        cy.getBySelLike('tooltip-content').contains(
            `January 1, ${previousYear} - December 31, ${currentYear}`
        )
    })
    it('the custom period persists when reopening the modal', () => {
        openModal(TEST_DIM_ID)
        cy.getBySel('start-date-input')
            .find('input')
            .invoke('val')
            .should('eq', `${previousYear}-01-01`)
        cy.getBySel('end-date-input')
            .find('input')
            .invoke('val')
            .should('eq', `${currentYear}-12-31`)
    })
    it('the custom period is cleared when one date is removed', () => {
        clearInput('start-date-input')
        cy.getBySel('period-dimension-modal-action-confirm')
            .contains('Update')
            .click()

        cy.getBySelLike('layout-chip')
            .containsExact(TEST_DIM_NAME)
            .trigger('mouseover')

        cy.getBySelLike('tooltip-content').contains('None selected')

        openModal(TEST_DIM_ID)

        cy.contains('Choose from presets').should('have.class', 'selected')
    })
    it('the custom period is cleared when the preset date tab is toggled', () => {
        cy.contains('Define start - end dates').click()

        typeInput('start-date-input', `${previousYear}-01-01`)
        typeInput('end-date-input', `${currentYear}-12-31`)

        cy.getBySel('period-dimension-modal-action-confirm')
            .contains('Update')
            .click()

        cy.getBySelLike('layout-chip')
            .contains(`${TEST_DIM_NAME}: 1 selected`)
            .trigger('mouseover')

        cy.getBySelLike('tooltip-content').contains(
            `January 1, ${previousYear} - December 31, ${currentYear}`
        )

        openModal(TEST_DIM_ID)

        cy.contains('Choose from presets').click()

        cy.getBySel('period-dimension-modal-action-confirm')
            .contains('Update')
            .click()

        cy.getBySelLike('layout-chip')
            .containsExact(TEST_DIM_NAME)
            .trigger('mouseover')

        cy.getBySelLike('tooltip-content').contains('None selected')
    })
})
