import { AXIS_ID_COLUMNS, AXIS_ID_FILTERS } from '@dhis2/analytics'
import { E2E_PROGRAM } from '../data/index.js'
import { selectEventWithProgram } from '../helpers/dimensions.js'
import {
    expectAxisToHaveDimension,
    expectAxisToNotHaveDimension,
} from '../helpers/layout.js'
import { goToStartPage } from '../helpers/startScreen.js'

describe('using the main sidebar context menu', () => {
    const TEST_DIM_ID = 'eventDate'
    const openContextMenu = (id) =>
        cy
            .getBySel('main-sidebar')
            .findBySel(`dimension-item-${id}`)
            .findBySel('dimension-menu-button')
            .invoke('attr', 'style', 'visibility: initial')
            .click()

    it('adds item', () => {
        goToStartPage()

        expectAxisToNotHaveDimension(AXIS_ID_COLUMNS, TEST_DIM_ID)
        expectAxisToNotHaveDimension(AXIS_ID_FILTERS, TEST_DIM_ID)

        openContextMenu(TEST_DIM_ID)
        cy.contains('Add to Columns').click()
        expectAxisToHaveDimension(AXIS_ID_COLUMNS, TEST_DIM_ID)
        expectAxisToNotHaveDimension(AXIS_ID_FILTERS, TEST_DIM_ID)
    })
    it('moves item', () => {
        openContextMenu(TEST_DIM_ID)
        cy.contains('Move to Filter').click()
        expectAxisToHaveDimension(AXIS_ID_FILTERS, TEST_DIM_ID)
        expectAxisToNotHaveDimension(AXIS_ID_COLUMNS, TEST_DIM_ID)
    })
    it('removes item', () => {
        openContextMenu(TEST_DIM_ID)
        cy.containsExact('Remove').click()
        expectAxisToNotHaveDimension(AXIS_ID_COLUMNS, TEST_DIM_ID)
        expectAxisToNotHaveDimension(AXIS_ID_FILTERS, TEST_DIM_ID)
    })
})

describe('using the layout chip context menu', () => {
    const TEST_DIM_ID = 'ou'
    const openContextMenu = (id) =>
        cy
            .getBySel(`layout-chip-${id}`)
            .findBySel('dimension-menu-button')
            .click()

    it('moves item', () => {
        goToStartPage()

        expectAxisToHaveDimension(AXIS_ID_COLUMNS, TEST_DIM_ID)
        expectAxisToNotHaveDimension(AXIS_ID_FILTERS, TEST_DIM_ID)

        openContextMenu(TEST_DIM_ID)
        cy.contains('Move to Filter').click()
        expectAxisToHaveDimension(AXIS_ID_FILTERS, TEST_DIM_ID)
        expectAxisToNotHaveDimension(AXIS_ID_COLUMNS, TEST_DIM_ID)
    })
    it('removes item', () => {
        openContextMenu(TEST_DIM_ID)
        cy.containsExact('Remove').click()
        expectAxisToNotHaveDimension(AXIS_ID_COLUMNS, TEST_DIM_ID)
        expectAxisToNotHaveDimension(AXIS_ID_FILTERS, TEST_DIM_ID)
    })
})

describe('using the dimension list context menu', () => {
    const event = E2E_PROGRAM
    const TEST_DIM_ID = 'jfuXZB3A1ko.q3WWkESCxCK' // "E2E - Integer"
    const openContextMenu = (id) =>
        cy
            .getBySel('program-dimensions-list')
            .findBySel(`dimension-item-${id}`)
            .findBySel('dimension-menu-button')
            .invoke('attr', 'style', 'visibility: initial')
            .click()

    it('adds item', () => {
        goToStartPage()
        selectEventWithProgram(event)

        expectAxisToNotHaveDimension(AXIS_ID_COLUMNS, TEST_DIM_ID)
        expectAxisToNotHaveDimension(AXIS_ID_FILTERS, TEST_DIM_ID)

        openContextMenu(TEST_DIM_ID)
        cy.contains('Add to Columns').click()
        expectAxisToHaveDimension(AXIS_ID_COLUMNS, TEST_DIM_ID)
        expectAxisToNotHaveDimension(AXIS_ID_FILTERS, TEST_DIM_ID)
    })
    it('moves item', () => {
        openContextMenu(TEST_DIM_ID)
        cy.contains('Move to Filter').click()
        expectAxisToHaveDimension(AXIS_ID_FILTERS, TEST_DIM_ID)
        expectAxisToNotHaveDimension(AXIS_ID_COLUMNS, TEST_DIM_ID)
    })
    it('removes item', () => {
        openContextMenu(TEST_DIM_ID)
        cy.containsExact('Remove').click()
        expectAxisToNotHaveDimension(AXIS_ID_COLUMNS, TEST_DIM_ID)
        expectAxisToNotHaveDimension(AXIS_ID_FILTERS, TEST_DIM_ID)
    })
})
