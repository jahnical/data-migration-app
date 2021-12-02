import i18n from '@dhis2/d2-i18n'
import { SingleSelectField, SingleSelectOption, Button, Input } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import classes from './styles/Condition.module.css'

const NULL_VALUE = 'NV'
export const OPERATOR_EQUAL = 'EQ'
export const OPERATOR_GREATER = 'GT'
export const OPERATOR_GREATER_OR_EQUAL = 'GE'
export const OPERATOR_LESS = 'LT'
export const OPERATOR_LESS_OR_EQUAL = 'LE'
export const OPERATOR_NOT_EQUAL = '!EQ'
export const OPERATOR_EMPTY = `EQ:${NULL_VALUE}`
export const OPERATOR_NOT_EMPTY = `NE:${NULL_VALUE}`

const operators = {
    [OPERATOR_EQUAL]: 'equal to (=)',
    [OPERATOR_GREATER]: 'greater than (>)',
    [OPERATOR_GREATER_OR_EQUAL]: 'greater than or equal to (≥)',
    [OPERATOR_LESS]: 'less than (<)',
    [OPERATOR_LESS_OR_EQUAL]: 'less than or equal to (≤)',
    [OPERATOR_NOT_EQUAL]: 'not equal to (≠)',
    [OPERATOR_EMPTY]: 'is empty / null',
    [OPERATOR_NOT_EMPTY]: 'is not empty / not null',
}

const NumericCondition = ({ condition, onChange, onRemove }) => {
    const [operator, value] = condition.includes(NULL_VALUE)
        ? [condition]
        : condition.split(':')

    const setOperator = input => {
        if (input.includes(NULL_VALUE)) {
            onChange(`${input}`)
        } else {
            onChange(`${input}:${value || ''}`)
        }
    }

    const setValue = input => onChange(`${operator}:${input || ''}`)

    return (
        <div className={classes.container}>
            <SingleSelectField
                selected={operator}
                inputWidth="280px"
                placeholder={i18n.t('Choose a condition type')}
                dense
                onChange={({ selected }) => setOperator(selected)}
            >
                {Object.keys(operators).map(key => (
                    <SingleSelectOption
                        key={key}
                        value={key}
                        label={operators[key]}
                    />
                ))}
            </SingleSelectField>
            {operator && !operator.includes(NULL_VALUE) && (
                <Input
                    value={value}
                    type="number"
                    onChange={({ value }) => setValue(value)}
                    width="150px"
                    dense
                />
            )}
            <Button
                type="button"
                small
                secondary
                onClick={onRemove}
                className={classes.removeButton}
            >
                {i18n.t('Remove')}
            </Button>
        </div>
    )
}

NumericCondition.propTypes = {
    condition: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
}

export default NumericCondition
