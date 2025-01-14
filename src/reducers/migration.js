import { VALUE_TYPE_DATETIME, VALUE_TYPE_TEXT } from '@dhis2/analytics'
import { FILTERABLE_TYPES, filterTeis } from '../modules/migration.js'

// Action Types
export const MIGRATION_TYPES = {
    SET_ORG_UNIT: 'MIGRATION_SET_ORG_UNIT',
    SET_TARGET_ORG_UNIT: 'MIGRATION_SET_TARGET_ORG_UNIT',
    SET_PROGRAM: 'MIGRATION_SET_PROGRAM',
    SET_CREDENTIALS: 'MIGRATION_SET_CREDENTIALS',
    ADD_FILTER: 'MIGRATION_SET_FILTERS',
    UPDATE_FILTER: 'MIGRATION_UPDATE_FILTER',
    REMOVE_FILTER: 'MIGRATION_REMOVE_FILTER',
    ADD_DISPLAY_ATTRIBUTE: 'MIGRATION_ADD_DISPLAY_ATTRIBUTE',
    REMOVE_DISPLAY_ATTRIBUTE: 'MIGRATION_REMOVE_DISPLAY_ATTRIBUTE',
    RESET: 'MIGRATION_RESET',
    FETCH_TEIS_START: 'FETCH_TEIS_START',
    FETCH_TEIS_SUCCESS: 'FETCH_TEIS_SUCCESS',
    FETCH_TEIS_ERROR: 'FETCH_TEIS_ERROR',
    MIGRATE_TEIS_START: 'MIGRATE_TEIS_START',
    MIGRATE_TEIS_SUCCESS: 'MIGRATE_TEIS_SUCCESS',
    MIGRATE_TEIS_ERROR: 'MIGRATE_TEIS_ERROR',
}

// Initial States
const formInitialState = {
    orgUnitId: null,
    targetOrgUnitId: null,
    programId: null,
    credentials: {
        username: '',
        password: '',
    },
    attributesToDisplay: [],
    filters: [],
}

const migrationInitialState = {
    teis: [],
    loading: false,
    error: null,
    migrationStatus: null,
}

// Form Reducer
export function migrationForm(state = formInitialState, action) {
    switch (action.type) {
        case MIGRATION_TYPES.SET_ORG_UNIT:
            return { ...state, orgUnitId: action.payload }

        case MIGRATION_TYPES.SET_TARGET_ORG_UNIT:
            return { ...state, targetOrgUnitId: action.payload }

        case MIGRATION_TYPES.SET_PROGRAM:
            return { ...state, programId: action.payload }

        case MIGRATION_TYPES.SET_CREDENTIALS:
            return {
                ...state,
                credentials: { ...state.credentials, ...action.payload },
            }

        case MIGRATION_TYPES.ADD_FILTER:
            return {
                ...state,
                filters: [...state.filters, action.payload],
            }

        case MIGRATION_TYPES.UPDATE_FILTER:
            return {
                ...state,
                filters: state.filters.map((filter) =>
                    filter.field === action.payload.field
                        ? action.payload
                        : filter
                ),
            }

        case MIGRATION_TYPES.ADD_DISPLAY_ATTRIBUTE:
            return {
                ...state,
                attributesToDisplay: [
                    ...state.attributesToDisplay,
                    action.payload,
                ],
            }

        case MIGRATION_TYPES.REMOVE_DISPLAY_ATTRIBUTE:
            return {
                ...state,
                attributesToDisplay: state.attributesToDisplay.filter(
                    (attr) => attr !== action.payload
                ),
            }

        case MIGRATION_TYPES.REMOVE_FILTER:
            return {
                ...state,
                filters: state.filters.filter(
                    (filter) => filter.field !== action.payload.name
                ),
            }

        case MIGRATION_TYPES.RESET:
            return formInitialState

        default:
            return state
    }
}

// Migration Process Reducer
export function migration(state = migrationInitialState, action) {
    switch (action.type) {
        case MIGRATION_TYPES.FETCH_TEIS_START:
        case MIGRATION_TYPES.MIGRATE_TEIS_START:
            return { ...state, loading: true, error: null }

        case MIGRATION_TYPES.FETCH_TEIS_SUCCESS:
            return { ...state, loading: false, teis: action.payload }

        case MIGRATION_TYPES.MIGRATE_TEIS_SUCCESS:
            return {
                ...state,
                loading: false,
                migrationStatus: 'success',
                teis: [],
            }

        case MIGRATION_TYPES.FETCH_TEIS_ERROR:
        case MIGRATION_TYPES.MIGRATE_TEIS_ERROR:
            return { ...state, loading: false, error: action.payload }

        case MIGRATION_TYPES.RESET:
            return migrationInitialState

        default:
            return state
    }
}

// Selectors
export const migrationSelectors = {
    getMigrationState: (state) => state.migrationForm,
    getMigrationOrgUnit: (state) => state.migrationForm.orgUnitId,
    getMigrationTargetOrgUnit: (state) => state.migrationForm.targetOrgUnitId,
    getMigrationProgram: (state) => state.migrationForm.programId,
    getMigrationCredentials: (state) => state.migrationForm.credentials,
    getMigrationFilters: (state) => state.migrationForm.filters,
    getMigrationIsLoading: (state) => state.migration.loading,
    getMigrationError: (state) => state.migration.error,
    getMigrationMigrationStatus: (state) => state.migration.migrationStatus,
    getMigrationAttributesToDisplay: (state) =>
        state.migrationForm.attributesToDisplay,
    getMigrationRawTEIs: (state) => state.migration.teis,
    getMigrationTEIs: (state) => {
        const teis = state.migration.teis
        return filterTeis(
            teis.map((tei) => {
                const attributes =
                    tei.attributes?.map((attr) => ({
                        attribute: attr.attribute,
                        name: attr.displayName,
                        valueType: attr.valueType,
                        value: attr.value,
                    })) ?? []

                const storedBy = tei.attributes?.find(
                    (attr) => attr.storedBy
                ).storedBy

                return {
                    id: tei.trackedEntityInstance,
                    created: tei.created,
                    lastUpdated: tei.lastUpdated,
                    createdBy: tei.createdByUserInfo ?? {},
                    storedBy: storedBy,
                    lastUpdatedBy: tei.lastUpdatedByUserInfo ?? {},
                    attributes,
                    filterableFields: [
                        ...[
                            {
                                name: 'Created At',
                                value: tei.created,
                                valueType: VALUE_TYPE_DATETIME,
                            },
                            {
                                name: 'Last Updated At',
                                value: tei.lastUpdated,
                                valueType: VALUE_TYPE_DATETIME,
                            },
                            {
                                name: 'Stored By',
                                value: storedBy,
                                valueType: VALUE_TYPE_TEXT,
                            },
                            {
                                name: 'Last Updated By',
                                value: tei.lastUpdatedByUserInfo?.username,
                                valueType: VALUE_TYPE_TEXT,
                            },
                        ],
                        ...attributes,
                    ].filter((field) =>
                        FILTERABLE_TYPES.includes(field.valueType)
                    ),
                }
            }),
            state.migrationForm.filters
        )
    },
}
