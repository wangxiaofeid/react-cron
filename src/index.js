import React, { Fragment, useState, useCallback, useRef, useEffect } from 'react';
import { Select, TimePicker, Input } from 'antd';
import moment from 'moment';

const Option = Select.Option;
const mwidth80 = { minWidth: 80, marginRight: 10 };
const width150 = { width: 150 };
const eachNum = (start, end, str) => {
    const back = [];
    for (let i = start; i <= end; i++) {
        back.push({
            value: `${i}`,
            label: `${i}${str}`,
        });
    }
    return back;
};
const dayOfWeekList = [
    { label: '周一', value: '1' },
    { label: '周二', value: '2' },
    { label: '周三', value: '3' },
    { label: '周四', value: '4' },
    { label: '周五', value: '5' },
    { label: '周六', value: '6' },
    { label: '周日', value: '7' },
];
const minuteOfHoursList = eachNum(0, 59, '分');
const dayOfMonthList = [
    ...eachNum(1, 31, '号'),
    {
        label: '月末',
        value: 'L',
    },
];
const monthOfYearList = eachNum(1, 12, '月');
const freqList = [
    { value: 'everyHours', label: '每小时' },
    { value: 'everyday', label: '每天' },
    { value: 'week', label: '每周' },
    { value: 'month', label: '每月' },
    { value: 'year', label: '每年' },
    { value: 'custom', label: '自定义' },
];
const cornFormat = (corn, mode) => {
    const value = corn || '0 0 0 * * ? *';
    const cronElements = value.split(' ');
    let [ss, mm, HH, dd, MM, week, yyyy] = cronElements;
    let freq;
    if (yyyy !== '*' || /[-\/#]/.test(value) || (!mode && /[,]/.test(value))) {
        freq = 'custom';
    } else if (week !== '?') {
        freq = 'week';
    } else if (MM === '*' && dd === '*' && HH === '*' && ss === '*') {
        freq = 'everyHours';
    } else if (MM === '*' && dd === '*') {
        freq = 'everyday';
    } else if (MM === '*') {
        freq = 'month';
    } else if (MM !== '*') {
        freq = 'year';
    }

    return {
        freq,
        stringValue: value,
        ss: parseInt(ss) || 0,
        mm: freq === 'everyHours' && !mode ? mm.split(',').filter((i) => !!i) : parseInt(mm) || 0,
        HH: parseInt(HH) || 0,
        dd: dd.split(',').filter((i) => !!i),
        MM: MM.split(',').filter((i) => !!i),
        week: week.split(',').filter((i) => !!i),
        yyyy,
    };
};
const cornStringify = ({ freq, stringValue, ss, mm, HH, dd, MM, week, yyyy }) => {
    if (freq === 'custom') {
        return stringValue;
    } else if (freq === 'year') {
        week = '?';
        if (!dd || dd.length <= 0) {
            dd = '*';
        }
    } else if (freq === 'month') {
        MM = '*';
        week = '?';
    } else if (freq === 'week') {
        MM = '*';
        dd = '?';
    } else if (freq === 'everyday') {
        MM = '*';
        week = '?';
        dd = '*';
    } else if (freq === 'everyHours') {
        MM = '*';
        week = '?';
        dd = '*';
        HH = '*';
        ss = '0';
    }

    return `${ss} ${mm} ${HH} ${dd} ${MM} ${week} ${yyyy}`;
};

export default function CronForm({ defaultValue, value, onChange, multiple }) {
    const [objValue, setObjValue] = useState({});
    const thisCron = useRef('');
    const changeValue = useCallback((newObj) => {
        const cronString = cornStringify(newObj);
        thisCron.current = cronString;
        onChange && onChange(cronString);
    });
    const onFreqChanged = useCallback((freq) => {
        setObjValue((oldObj) => {
            const newObj = {
                ...oldObj,
                freq,
                week: freq === 'week' ? ['1'] : [],
                dd: freq === 'month' ? ['1'] : [],
                mm: Array.isArray(oldObj.mm) ? 0 : oldObj.mm,
                ...(freq === 'everyHours' && multiple
                    ? {
                          mm: ['0'],
                      }
                    : {}),
                MM: freq === 'year' ? ['1'] : '*',
                ...(freq === 'custom'
                    ? {
                          stringValue: cornStringify(oldObj),
                      }
                    : {}),
            };
            changeValue(newObj);
            return newObj;
        });
    }, []);
    const onMonthOfYearChanged = useCallback((MM) => {
        setObjValue((oldObj) => {
            const newObj = {
                ...oldObj,
                MM,
            };
            changeValue(newObj);
            return newObj;
        });
    }, []);
    const onDayOfWeekChanged = useCallback((week) => {
        setObjValue((oldObj) => {
            const newObj = {
                ...oldObj,
                week,
            };
            changeValue(newObj);
            return newObj;
        });
    }, []);
    const onDayOfMonthChanged = useCallback((dd) => {
        setObjValue((oldObj) => {
            const newObj = {
                ...oldObj,
                dd,
            };
            changeValue(newObj);
            return newObj;
        });
    }, []);
    const onFreqTimeChanged = useCallback((time) => {
        setObjValue((oldObj) => {
            const newTime = time
                ? { ss: time.second(), mm: time.minute(), HH: time.hour() }
                : { ss: 0, mm: 0, HH: 0 };
            const newObj = {
                ...oldObj,
                ...newTime,
            };
            changeValue(newObj);
            return newObj;
        });
    }, []);
    const onMinuteOfHoursListChanged = useCallback((mm) => {
        setObjValue((oldObj) => {
            const newObj = {
                ...oldObj,
                mm,
            };
            changeValue(newObj);
            return newObj;
        });
    }, []);
    const onStringValueChanged = useCallback((e) => {
        e.persist();
        setObjValue((oldObj) => {
            const newObj = {
                ...oldObj,
                stringValue: e.target.value,
            };
            changeValue(newObj);
            return newObj;
        });
    }, []);
    useEffect(() => {
        thisCron.current = value;
        setObjValue(cornFormat(value || defaultValue, multiple));
    }, []);
    useEffect(() => {
        if (thisCron.current !== value) {
            thisCron.current = value;
            setObjValue(cornFormat(value, multiple));
        }
    }, [value]);
    const { freq, stringValue, ss, mm, HH, dd = [], MM, week = [], yyyy } = objValue;
    const mode = multiple ? 'multiple' : undefined;
    const isYear = freq === 'year',
        isMonth = freq === 'month',
        isWeek = freq === 'week',
        isHours = freq === 'everyHours',
        isCustom = freq === 'custom';
    return (
        <Fragment>
            <Select value={freq} onChange={onFreqChanged} style={mwidth80}>
                {freqList.map(({ value, label }) => (
                    <Option key={value} value={value}>
                        {label}
                    </Option>
                ))}
            </Select>

            {isYear && (
                <Select
                    value={MM}
                    onChange={onMonthOfYearChanged}
                    mode={mode}
                    style={mwidth80}
                    placeholder="月份"
                >
                    {monthOfYearList.map(({ value, label }) => (
                        <Option key={value} value={value}>
                            {label}
                        </Option>
                    ))}
                </Select>
            )}

            {(isYear || isMonth) && (
                <Select
                    value={dd}
                    onChange={onDayOfMonthChanged}
                    mode={mode}
                    style={mwidth80}
                    placeholder="日期"
                    allowClear={isYear}
                >
                    {dayOfMonthList.map(({ value, label }) => (
                        <Option key={value} value={value}>
                            {label}
                        </Option>
                    ))}
                </Select>
            )}

            {isWeek && (
                <Select
                    value={week}
                    onChange={onDayOfWeekChanged}
                    mode={mode}
                    style={mwidth80}
                    placeholder="日期"
                >
                    {dayOfWeekList.map(({ value, label }) => (
                        <Option key={value} value={value}>
                            {label}
                        </Option>
                    ))}
                </Select>
            )}

            {isHours && (
                <Select
                    value={mm}
                    onChange={onMinuteOfHoursListChanged}
                    mode={mode}
                    style={mwidth80}
                    placeholder="分钟"
                >
                    {minuteOfHoursList.map(({ value, label }) => (
                        <Option key={value} value={value}>
                            {label}
                        </Option>
                    ))}
                </Select>
            )}

            {!isHours && !isCustom && (
                <TimePicker value={moment({ h: HH, m: mm, s: ss })} onChange={onFreqTimeChanged} />
            )}

            {isCustom && (
                <Input style={width150} value={stringValue} onChange={onStringValueChanged} />
            )}
        </Fragment>
    );
}
