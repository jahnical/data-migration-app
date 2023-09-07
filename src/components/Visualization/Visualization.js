import {
    getColorByValueFromLegendSet,
    LegendKey,
    LEGEND_DISPLAY_STYLE_FILL,
    LEGEND_DISPLAY_STYLE_TEXT,
    VALUE_TYPE_NUMBER,
    VALUE_TYPE_INTEGER,
    VALUE_TYPE_INTEGER_POSITIVE,
    VALUE_TYPE_INTEGER_NEGATIVE,
    VALUE_TYPE_INTEGER_ZERO_OR_POSITIVE,
    VALUE_TYPE_PERCENTAGE,
    VALUE_TYPE_UNIT_INTERVAL,
    VALUE_TYPE_TIME,
    VALUE_TYPE_DATE,
    VALUE_TYPE_DATETIME,
    VALUE_TYPE_PHONE_NUMBER,
    VALUE_TYPE_URL,
} from '@dhis2/analytics'
import { useDhis2ConnectionStatus } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    DataTable,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead,
    DataTableBody,
    DataTableFoot,
    Pagination,
    Tooltip,
    NoticeBox,
} from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, {
    useState,
    useEffect,
    useMemo,
    useRef,
    useCallback,
    useReducer,
} from 'react'
import { getRequestOptions } from '../../modules/getRequestOptions.js'
import {
    DISPLAY_DENSITY_COMFORTABLE,
    DISPLAY_DENSITY_COMPACT,
    FONT_SIZE_LARGE,
    FONT_SIZE_NORMAL,
    FONT_SIZE_SMALL,
} from '../../modules/options.js'
import {
    getFormattedCellValue,
    getHeaderText,
} from '../../modules/tableValues.js'
import { isAoWithTimeDimension } from '../../modules/timeDimensions.js'
import {
    getHeadersMap,
    transformVisualization,
} from '../../modules/visualization.js'
import styles from './styles/Visualization.module.css'
import {
    getAdaptedVisualization,
    useAnalyticsData,
} from './useAnalyticsData.js'

export const DEFAULT_SORT_DIRECTION = 'asc'
export const FIRST_PAGE = 1
export const PAGE_SIZE = 100
// +/- min width of "Rows per page" select + 2 * padding
// + 30% in case label text are longer than English
export const PAGINATION_MIN_WIDTH = 250

const getFontSizeClass = (fontSize) => {
    switch (fontSize) {
        case FONT_SIZE_LARGE:
            return styles.fontSizeLarge
        case FONT_SIZE_SMALL:
            return styles.fontSizeSmall
        case FONT_SIZE_NORMAL:
        default:
            return styles.fontSizeNormal
    }
}

const getSizeClass = (displayDensity) => {
    switch (displayDensity) {
        case DISPLAY_DENSITY_COMFORTABLE:
            return styles.sizeComfortable
        case DISPLAY_DENSITY_COMPACT:
            return styles.sizeCompact
        default:
            return styles.sizeNormal
    }
}

const getDataTableScrollHeight = (isInModal, noTimeDimensionWarningRef) => {
    if (isInModal) {
        const reservedHeight =
            285 + (noTimeDimensionWarningRef?.current?.clientHeight ?? 0)
        return `calc(100vh - ${reservedHeight}px)`
    } else {
        return '100%'
    }
}

const PaginationComponent = ({ offline, ...props }) =>
    offline ? (
        <Tooltip content={i18n.t('Not available offline')}>
            <Pagination {...props} />
        </Tooltip>
    ) : (
        <Pagination {...props} />
    )

PaginationComponent.propTypes = {
    offline: PropTypes.bool,
}

export const Visualization = ({
    filters,
    visualization: AO,
    isVisualizationLoading,
    displayProperty,
    onResponsesReceived,
    onColumnHeaderClick,
    onError,
}) => {
    const noTimeDimensionWarningRef = useRef(null)
    const dataTableRef = useRef(null)
    const [uniqueLegendSets, setUniqueLegendSets] = useState([])
    const [measuredDimensions, setMeasuredDimensions] = useState({
        paginationMaxWidth: 0,
        noticeBoxMaxWidth: 0,
    })
    const [{ sortField, sortDirection, pageSize, page }, setSorting] =
        useReducer((sorting, newSorting) => ({ ...sorting, ...newSorting }), {
            sortField: null,
            sortDirection: DEFAULT_SORT_DIRECTION,
            page: FIRST_PAGE,
            pageSize: PAGE_SIZE,
        })

    const visualization = useMemo(() => AO && transformVisualization(AO), [AO])
    const isInModal = !!filters?.relativePeriodDate
    const hasTimeDimension = useMemo(
        () => isAoWithTimeDimension(visualization),
        [visualization]
    )
    const shouldShowTimeDimensionWarning = isInModal && !hasTimeDimension

    const visualizationRef = useRef(visualization)

    const containerCallbackRef = useCallback((node) => {
        if (node === null) {
            return
        }

        const adjustSize = () => {
            if (node.clientWidth === 0) {
                return
            }
            const containerInnerWidth = node.clientWidth
            const scrollBox = node.querySelector('.tablescrollbox')
            const scrollbarWidth = scrollBox.offsetWidth - scrollBox.clientWidth
            const paginationMaxWidth = Math.max(
                containerInnerWidth - scrollbarWidth,
                PAGINATION_MIN_WIDTH
            )

            setMeasuredDimensions({
                paginationMaxWidth,
                noticeBoxMaxWidth: scrollBox.offsetWidth,
            })
        }

        const sizeObserver = new window.ResizeObserver(adjustSize)
        sizeObserver.observe(node)

        adjustSize()

        return sizeObserver.disconnect
    }, [])

    const setPage = useCallback(
        (pageNum) =>
            setSorting({
                page: pageNum,
            }),
        []
    )
    const { isDisconnected: offline } = useDhis2ConnectionStatus()

    const { headers } = getAdaptedVisualization(visualization)

    if (headers && sortField) {
        // reset sorting if current sortField has been removed from Columns DHIS2-13948
        if (!headers.includes(sortField)) {
            setSorting({
                sortField: null,
                sortDirection: DEFAULT_SORT_DIRECTION,
            })
        }
    }

    const { fetching, error, data } = useAnalyticsData({
        filters,
        visualization,
        isVisualizationLoading,
        displayProperty,
        onResponsesReceived,
        pageSize,
        // Set first page directly for new visualization to avoid extra request with current page
        page: visualization !== visualizationRef.current ? FIRST_PAGE : page,
        sortField,
        sortDirection,
    })

    const fetchContainerRef = useRef(null)
    const dataTableHeadRef = useRef(null)
    const dataTableFootRef = useRef(null)
    const fetchIndicatorTop = useMemo(() => {
        if (
            !fetching ||
            !fetchContainerRef?.current ||
            !dataTableHeadRef?.current ||
            !dataTableFootRef?.current
        ) {
            return 'calc(50% - 12px)'
        }

        const containerHeight = fetchContainerRef.current.clientHeight
        const headHeight = dataTableHeadRef.current.offsetHeight
        const footHeight = dataTableFootRef.current.offsetHeight
        // tbody height excluding the parts hidden by scrolling
        const visibleBodyHeight = containerHeight - headHeight - footHeight
        // 12 px is half the loader height
        const top = Math.round(headHeight + visibleBodyHeight / 2 - 12)

        return `${top}px`
    }, [fetching])

    // Reset page for new visualizations
    useEffect(() => {
        visualizationRef.current = visualization
        setPage(FIRST_PAGE)
    }, [visualization, setPage])

    useEffect(() => {
        if (data && visualization) {
            const allLegendSets = data.headers
                .filter((header) => header.legendSet)
                .map((header) => header.legendSet)
            const relevantLegendSets = allLegendSets.filter(
                (e, index) =>
                    allLegendSets.findIndex((a) => a.id === e.id) === index &&
                    e.legends?.length
            )
            if (relevantLegendSets.length && visualization.legend?.showKey) {
                setUniqueLegendSets(relevantLegendSets)
            } else {
                setUniqueLegendSets([])
            }
        } else {
            setUniqueLegendSets([])
        }
    }, [data, visualization])

    useEffect(() => {
        if (error && onError) {
            onError(error)
        }
    }, [error, onError])

    if (!data || error) {
        return null
    }

    const sizeClass = getSizeClass(visualization.displayDensity)
    const fontSizeClass = getFontSizeClass(visualization.fontSize)
    const colSpan = String(Math.max(data.headers.length, 1))

    const sortData = ({ name, direction }) =>
        setSorting({
            sortField: name,
            sortDirection: direction,
            page: FIRST_PAGE,
        })

    const setPageSize = (pageSizeNum) =>
        setSorting({
            pageSize: pageSizeNum,
            page: FIRST_PAGE,
        })

    const dimensionHeadersMap = getHeadersMap(getRequestOptions(visualization))

    const reverseLookupDimensionId = (dimensionId) =>
        Object.keys(dimensionHeadersMap).find(
            (key) => dimensionHeadersMap[key] === dimensionId
        )

    const formatCellValue = (value, header) => {
        if (header?.valueType === VALUE_TYPE_URL) {
            return (
                <a href={value} target="_blank" rel="noreferrer">
                    {value}
                </a>
            )
        } else {
            return getFormattedCellValue({ value, header, visualization })
        }
    }

    const cellValueShouldNotWrap = (header) =>
        [
            VALUE_TYPE_NUMBER,
            VALUE_TYPE_INTEGER,
            VALUE_TYPE_INTEGER_POSITIVE,
            VALUE_TYPE_INTEGER_NEGATIVE,
            VALUE_TYPE_INTEGER_ZERO_OR_POSITIVE,
            VALUE_TYPE_PERCENTAGE,
            VALUE_TYPE_UNIT_INTERVAL,
            VALUE_TYPE_TIME,
            VALUE_TYPE_DATE,
            VALUE_TYPE_DATETIME,
            VALUE_TYPE_PHONE_NUMBER,
        ].includes(header.valueType) && !header.optionSet

    const formatCellHeader = (header) => {
        const headerText = getHeaderText(header)

        const dimensionId = Number.isInteger(header.stageOffset)
            ? header.name.replace(/\[-?\d+\]/, '')
            : header.name

        return (
            <span
                className={cx(styles.headerCell, styles.dimensionModalHandler)}
                onClick={
                    onColumnHeaderClick
                        ? () =>
                              onColumnHeaderClick(
                                  reverseLookupDimensionId(dimensionId) ||
                                      dimensionId
                              )
                        : undefined
                }
            >
                {headerText}
            </span>
        )
    }

    const getLegendKey = () => (
        <div
            className={styles.legendKeyScrollbox}
            data-test="visualization-legend-key"
        >
            <LegendKey legendSets={uniqueLegendSets} />
        </div>
    )

    return (
        <div className={styles.pluginContainer} ref={containerCallbackRef}>
            <div
                data-test="line-list-fetch-container"
                className={cx(styles.fetchContainer, {
                    [styles.fetching]: fetching,
                })}
                ref={fetchContainerRef}
            >
                <div
                    className={styles.fetchIndicator}
                    style={{ top: fetchIndicatorTop }}
                />
                <div className={styles.visualizationContainer}>
                    {shouldShowTimeDimensionWarning && (
                        <div
                            className={styles.noTimeDimensionWarning}
                            ref={noTimeDimensionWarningRef}
                            style={{
                                maxWidth: measuredDimensions.noticeBoxMaxWidth,
                            }}
                        >
                            <NoticeBox warning>
                                {i18n.t(
                                    'This line list may show data that was not available when the interpretation was written.'
                                )}
                            </NoticeBox>
                        </div>
                    )}
                    <DataTable
                        scrollHeight={getDataTableScrollHeight(
                            isInModal,
                            noTimeDimensionWarningRef
                        )}
                        scrollWidth="100%"
                        width="auto"
                        className={styles.dataTable}
                        dataTest="line-list-table"
                        ref={dataTableRef}
                    >
                        <DataTableHead ref={dataTableHeadRef}>
                            <DataTableRow>
                                {data.headers.map((header, index) =>
                                    header ? (
                                        <DataTableColumnHeader
                                            fixed
                                            top="0"
                                            key={header.name}
                                            name={header.name}
                                            onSortIconClick={sortData}
                                            sortDirection={
                                                offline
                                                    ? undefined
                                                    : header.name === sortField
                                                    ? sortDirection
                                                    : 'default'
                                            }
                                            sortIconTitle={i18n.t(
                                                'Sort by {{column}}',
                                                {
                                                    column: getHeaderText(
                                                        header
                                                    ),
                                                }
                                            )}
                                            className={cx(
                                                styles.headerCell,
                                                fontSizeClass,
                                                sizeClass,
                                                'bordered'
                                            )}
                                            dataTest={'table-header'}
                                        >
                                            {formatCellHeader(header)}
                                        </DataTableColumnHeader>
                                    ) : (
                                        <DataTableColumnHeader
                                            fixed
                                            top="0"
                                            key={`undefined_${index}`} // FIXME this is due to pe not being present in headers, needs special handling
                                            className={cx(
                                                styles.headerCell,
                                                fontSizeClass,
                                                sizeClass
                                            )}
                                            dataTest={'table-header'}
                                        />
                                    )
                                )}
                            </DataTableRow>
                        </DataTableHead>
                        {/* https://jira.dhis2.org/browse/LIBS-278 */}
                        <DataTableBody dataTest={'table-body'}>
                            {data.rows.map((row, index) => (
                                <DataTableRow
                                    key={index}
                                    dataTest={'table-row'}
                                >
                                    {row.map((value, index) => (
                                        <DataTableCell
                                            key={index}
                                            className={cx(
                                                styles.cell,
                                                fontSizeClass,
                                                sizeClass,
                                                {
                                                    [styles.emptyCell]: !value,
                                                    [styles.nowrap]:
                                                        cellValueShouldNotWrap(
                                                            data.headers[index]
                                                        ),
                                                },
                                                'bordered'
                                            )}
                                            backgroundColor={
                                                visualization.legend?.style ===
                                                LEGEND_DISPLAY_STYLE_FILL
                                                    ? getColorByValueFromLegendSet(
                                                          data.headers[index]
                                                              .legendSet,
                                                          value
                                                      )
                                                    : undefined
                                            }
                                            dataTest={'table-cell'}
                                        >
                                            <div
                                                style={
                                                    visualization.legend
                                                        ?.style ===
                                                    LEGEND_DISPLAY_STYLE_TEXT
                                                        ? {
                                                              color: getColorByValueFromLegendSet(
                                                                  data.headers[
                                                                      index
                                                                  ].legendSet,
                                                                  value
                                                              ),
                                                          }
                                                        : {}
                                                }
                                            >
                                                {formatCellValue(
                                                    value,
                                                    data.headers[index]
                                                )}
                                            </div>
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))}
                        </DataTableBody>
                        <DataTableFoot
                            className={styles.stickyFooter}
                            ref={dataTableFootRef}
                        >
                            <DataTableRow>
                                <DataTableCell
                                    colSpan={colSpan}
                                    staticStyle
                                    className={styles.footerCell}
                                >
                                    <div
                                        className={cx(
                                            styles.stickyNavigation,
                                            sizeClass
                                        )}
                                        style={{
                                            maxWidth:
                                                measuredDimensions.paginationMaxWidth,
                                            minWidth: PAGINATION_MIN_WIDTH,
                                        }}
                                    >
                                        <PaginationComponent
                                            offline={offline}
                                            disabled={offline || fetching}
                                            page={data.pager.page}
                                            // DHIS2-13493: avoid a crash when the pager object in the analytics response is malformed.
                                            // When that happens pageSize is 0 which causes the crash because the Rows per page select does not have 0 listed as possible option.
                                            // The backend should always return the value passed in the request, even if there are no rows for the query.
                                            // The workaround here makes sure that if the pageSize returned is 0 we use a value which can be selected in the Rows per page select.
                                            pageSize={
                                                data.pager.pageSize || PAGE_SIZE
                                            }
                                            isLastPage={data.pager.isLastPage}
                                            onPageChange={setPage}
                                            onPageSizeChange={setPageSize}
                                            pageSizeSelectText={i18n.t(
                                                'Rows per page'
                                            )}
                                            pageLength={data.rows.length}
                                            pageSummaryText={({
                                                firstItem,
                                                lastItem,
                                                page,
                                            }) =>
                                                i18n.t(
                                                    'Page {{page}}, row {{firstItem}}-{{lastItem}}',
                                                    {
                                                        firstItem,
                                                        lastItem,
                                                        page,
                                                    }
                                                )
                                            }
                                        />
                                    </div>
                                </DataTableCell>
                            </DataTableRow>
                        </DataTableFoot>
                    </DataTable>
                </div>
                {Boolean(uniqueLegendSets.length) && getLegendKey()}
            </div>
        </div>
    )
}

Visualization.defaultProps = {
    displayProperty: 'name',
    isVisualizationLoading: false,
    onResponsesReceived: Function.prototype,
}

Visualization.propTypes = {
    displayProperty: PropTypes.string.isRequired,
    isVisualizationLoading: PropTypes.bool.isRequired,
    visualization: PropTypes.object.isRequired,
    onResponsesReceived: PropTypes.func.isRequired,
    filters: PropTypes.object,
    onColumnHeaderClick: PropTypes.func,
    onError: PropTypes.func,
}
