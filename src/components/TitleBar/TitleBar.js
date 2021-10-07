import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import {
    STATE_UNSAVED,
    STATE_SAVED,
    STATE_DIRTY,
    getVisualizationState,
} from '../../modules/visualization'
import { sGetCurrent } from '../../reducers/current'
import { sGetVisualization } from '../../reducers/visualization'
import classes from './styles/TitleBar.module.css'

export const getTitleUnsaved = () => i18n.t('Unsaved visualization')
export const getTitleDirty = () => i18n.t('Edited')

const defaultTitleClasses = `${classes.cell} ${classes.title}`

const getTitleText = (titleState, visualization) => {
    switch (titleState) {
        case STATE_UNSAVED:
            return getTitleUnsaved()
        case STATE_SAVED:
        case STATE_DIRTY:
            return visualization.name
        default:
            return ''
    }
}

const getCustomTitleClasses = titleState =>
    titleState === STATE_UNSAVED ? classes.titleUnsaved : ''

const getSuffix = titleState =>
    titleState === STATE_DIRTY ? (
        <div
            classes={`${classes.suffix} ${classes.titleDirty}`}
            data-test="AO-title-dirty"
        >{`- ${getTitleDirty()}`}</div>
    ) : (
        ''
    )

export const TitleBar = ({ titleState, titleText }) => {
    const titleClasses = `${defaultTitleClasses} ${getCustomTitleClasses(
        titleState
    )}`

    return titleText ? (
        <div data-test="AO-title" className={classes.titleBar}>
            <div className={titleClasses}>
                {titleText}
                {getSuffix(titleState)}
            </div>
        </div>
    ) : null
}

TitleBar.propTypes = {
    titleState: PropTypes.string,
    titleText: PropTypes.string,
}

const mapStateToProps = state => ({
    current: sGetCurrent(state),
    visualization: sGetVisualization(state),
})

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    const { visualization, current } = stateProps
    const titleState = getVisualizationState(visualization, current)
    return {
        ...dispatchProps,
        ...ownProps,
        titleState: titleState,
        titleText: getTitleText(titleState, visualization),
    }
}

export default connect(mapStateToProps, null, mergeProps)(TitleBar)