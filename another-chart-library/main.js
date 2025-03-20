import { SVG, extend as SVGextend, Element as SVGElement, PathArray } from 'https://cdnjs.cloudflare.com/ajax/libs/svg.js/3.1.2/svg.esm.js';
import { BarChart_ } from './src/bar.js';
import { PieChart_ } from './src/pie.js';
import { LineChart_ } from './src/line.js';

/**
 * @class Chart
 * @classdesc Create different types of charts from the given data. You can currently create {@link Chart.BarChart|bar charts}, {@link Chart.LineChart|line charts}, and {@link Chart.PieChart|pie charts}.
 * @param {string} type type of chart
 * @example
 * let chart = new Chart('bar')
 */
export class Chart {
    static classes = {
        'bar': BarChart_,
        'pie': PieChart_,
        'line': LineChart_
    }
    static type = ''
    static draw = null;
    static measureLines = []
    static precision = 10;

    static fullScreen = false;
    static width = 500;
    static height = 500;

    static options = null;

    static setTitle(draw, title) {
        draw.text().tspan(title).fill('#8e8e8e')
        .y(10)
        .x(10)
        .font({ family: 'Helvetica', size: Chart.options.height / 30  })
    }

    constructor(type) {
        if(!Object.keys(Chart.classes).includes(type)) throw new Error('Invalid chart type');
        this.type = type;
        Chart.type = type;
    }

    /**
     * @method appendTo
     * @memberof Chart
     * @description Append the chart to an element
     * @param {string} element        element to append the chart to
     * @param {object} options        options for the chart
     * @param {number} options.width  width of the chart
     * @param {number} options.height height of the chart
     * @example
     * // using a query selector
     * chart.appendTo('#chart', { width: 500, height: 500 })
     * // using a DOM element
     * chart.appendTo(document.getElementById('chart'), { width: 500, height: 500 })
     */
    appendTo(element, options) {
        options = options || {};
        options.width = options.width || 600;
        options.height = options.height || 600;

        Chart.options = options;

        Chart.draw = SVG().addTo(element).size(options.width, options.height);
        

        if(this.type == 'bar') {
            let h = options.height;
            let w = options.width;
            let p = Chart.precision;

            let xAxisLine = Chart.draw.line(h / p, h - h / p, w - 50, h - h / p).stroke({ width: 1, color: '#000' });
            let yAxisLine = Chart.draw.line(w / p, 50, w / p, h - h / p).stroke({ width: 1, color: '#000' });

            let rect = Chart.draw.rect(xAxisLine.attr('x2') - yAxisLine.attr('x1'), xAxisLine.attr('y1'))
            .move(yAxisLine.attr('x1'), yAxisLine.attr('y1')).fill('none')

            let xCenterLine = Chart.draw.line(rect.attr('x') + rect.attr('width') / 2, rect.attr('y'), rect.attr('x') + rect.attr('width') / 2, h - yAxisLine.attr('x1')).stroke('none')
            let yCenterLine = Chart.draw.line(yAxisLine.attr('x1') + 15, rect.attr('y') + rect.attr('height') / 2, w - 5, rect.attr('y') + rect.attr('height') / 2).stroke('none');

            Chart.measureLines = {
                xAxisLine: xAxisLine,
                yAxisLine: yAxisLine,
                rect: rect,
                xCenterLine: xCenterLine,
                yCenterLine: yCenterLine
            }
        }

        if(this.type == 'pie'){
            let xCenterLine = Chart.draw.line(options.width / 2, 0, options.width / 2, options.height).stroke('none');
            let yCenterLine = Chart.draw.line(0, options.height / 2, options.width, options.height / 2).stroke('none');
            
            let circle = Chart.draw.circle(options.width / 2)
            .cx(options.width / 2)
            .cy(options.height / 2)
            .fill('none')

            Chart.measureLines = {
                xCenterLine: xCenterLine,
                yCenterLine: yCenterLine,
                circle: circle
            }
        }

        if(this.type == 'line') {
            let h = options.height;
            let w = options.width;
            let p = Chart.precision;

            let xAxisLine = Chart.draw.line(h / p, h - h / p, w - 100, h - h / p).stroke({ width: 1, color: '#000' });
            let yAxisLine = Chart.draw.line(w / p, 50, w / p, h - h / p).stroke({ width: 1, color: '#000' });

            let rect = Chart.draw.rect(xAxisLine.attr('x2') - yAxisLine.attr('x1'), xAxisLine.attr('y1'))
            .move(yAxisLine.attr('x1'), yAxisLine.attr('y1')).fill('none')

            let xCenterLine = Chart.draw.line(rect.attr('x') + rect.attr('width') / 2, rect.attr('y'), rect.attr('x') + rect.attr('width') / 2, h - yAxisLine.attr('x1')).stroke('none')
            let yCenterLine = Chart.draw.line(yAxisLine.attr('x1') + 15, rect.attr('y') + rect.attr('height') / 2, w - 5, rect.attr('y') + rect.attr('height') / 2).stroke('none');

            Chart.measureLines = {
                xAxisLine: xAxisLine,
                yAxisLine: yAxisLine,
                rect: rect,
                xCenterLine: xCenterLine,
                yCenterLine: yCenterLine
            }
        }

        return this;
    }

    /**
     * @method setData
     * @memberof Chart
     * @param {object} args the arguments for the data
     * @description the arguments for the data, depending on the type of chart
     */
    setData(args) {
        switch(this.type) {
            case "bar": [this.chartTitle, this.xAxisLabel, this.yAxisLabel, this.yStep, this.density, this.xAxisData, this.yAxisData, this.barColor] = arguments; break;
            case "pie": [this.chartTitle, this.data, this.options] = arguments; break;
            case "line": [this.chartTitle, this.xAxisLabel, this.yAxisLabel, this.xStep, this.yStep, this.data] = arguments; break;
        }

        let chart = new Chart.classes[this.type](...arguments);

        switch(this.type) {
            case "pie": this.science = chart.science; break;
        }

        return this;
    }
}

export class PieChart extends Chart {
    /**
     * @param {object} obj the object to convert to pie data
     * @returns {object[]} the data for the pie chart
     * @example
     * let data = Chart.objectToPieData({
     *    "Blue": 42,
     *    "Green": 14,
     *    "Purple": 14,
     *    "Red": 8,
     *    "Black": 7,
     *    "Orange": 5,
     *    "Other": 10
     * })
     * // data = [
     * //    { arc: 42, color: '#ff0000', label: 'Blue' },
     * //    { arc: 14, color: '#ff0000', label: 'Green' },
     * //    { arc: 14, color: '#ff0000', label: 'Purple' },
     * //    { arc: 8, color: '#ff0000', label: 'Red' },
     * //    { arc: 8, color: '#ff0000', label: 'Red' },
     * //    { arc: 7, color: '#ff0000', label: 'Black' },
     * //    { arc: 5, color: '#ff0000', label: 'Orange' },
     * //    { arc: 10, color: '#ff0000', label: 'Other' }
     * // ]
     */
    static objectToPieData(obj){
        let max = 0;
        let objKeys = Object.keys(obj);
        objKeys.forEach(key => {
            max += obj[key];
        })

        let data = [];
        objKeys.forEach(key => {
            data.push({
                arc: obj[key] / max * 100,
                color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
                label: key
            })
        })

        return data;
    }
    /**
     * @param {string} element        element to append the chart to
     * @param {object} options        options for the chart
     * @param {number} options.width  width of the chart
     * @param {number} options.height height of the chart
     */
    constructor(element, options) {
        super('pie').appendTo(element, options)
    }
    /**
     * @class PieChart
     * @memberof Chart
     * @param {string}   chartTitle                              the title of the chart
     * @param {object[]} data                                    the data for the pie chart
     * @param {number}   data[].arc                              the length of the slice (in percent)
     * @param {string}   data[].color                            the color of the slice
     * @param {string}   data[].label                            the label for the slice
     * @param {object}   [options={}]                            the options for the pie chart
     * @param {number}   [options.popAmount=0]                   how far the slice should pop out when hovered over
     * @param {boolean}  [options.showPercentages=false]         whether or not to show the percentages of the slices
     * @param {boolean}  [options.donut=false]                   whether or not to make the pie chart a donut chart
     * @param {boolean}  [options.sliceOutlineWidth=1]           whether or not to show the percentages of the slices
     * @param {boolean}  [options.sliceOutlineColor=transparent] whether or not to show the percentages of the slices
     * @example 
        let chart = new PieChart('#pie-chart')
        .setData("Favorite Color", [
            { arc: 42, color: 'blue', label: 'Blue' },
            { arc: 14, color: 'green', label: 'Green' },
            { arc: 14, color: 'purple', label: 'Purple' },
            { arc: 8, color: 'red', label: "Red"},
            { arc: 7, color: 'black', label: "Black"},
            { arc: 5, color: 'orange', label: 'Orange'},
            { arc: 10, color: 'grey', label: "Other"},
        ], {
            popAmount: 10,
            showPercentages: true,
            donut: true,
            sliceOutlineWidth: 1,
            sliceOutlineColor: 'white'
    })
    */
    setData(chartTitle, data, options) {
        super.setData(chartTitle, data, options);
        return this;
    }

    example() {
        super.setData("Favorite Color", [
            { arc: 42, color: 'blue', label: 'Blue' },
            { arc: 14, color: 'green', label: 'Green' },
            { arc: 14, color: 'purple', label: 'Purple' },
            { arc: 8, color: 'red', label: "Red"},
            { arc: 7, color: 'black', label: "Black"},
            { arc: 5, color: 'orange', label: 'Orange'},
            { arc: 10, color: 'grey', label: "Other"},
        ], {
            popAmount: 4,
            showPercentages: true,
            donut: true,
            sliceOutlineWidth: 1,
            sliceOutlineColor: 'white'
        })

        return this;
    }
}

export class BarChart extends Chart {
    /**
     * @param {string} element        element to append the chart to
     * @param {object} options        options for the chart
     * @param {number} options.width  width of the chart
     * @param {number} options.height height of the chart
     */
    constructor(element, options) {
        super('bar').appendTo(element, options)
    }
    /**
     * @class BarChart
     * @memberof Chart
     * @param {string}            chartTitle title of the chart
     * @param {string}            xAxisLabel label for the x axis
     * @param {string}            yAxisLabel label for the y axis
     * @param {number}            step       step value
     * @param {number}            density    how many minor lines to draw
     * @param {string[]|number[]} xAxisData  data for the x axis
     * @param {string[]|number[]} yAxisData  data for the y axis
     * @param {string}            [barColor] color of the bars
     * @example
        let bar = new Chart('bar')
        .appendTo("#bar-chart")
        .setData("Motor Vehicle Deaths by Month (2021)", "Month", "Deaths", 1000, 4, 
            ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            [3099, 2561, 3214, 3557, 3768, 3789, 3879, 4013, 3861, 4101, 3599, 3498]
        )
    */
    setData(chartTitle, xAxisLabel, yAxisLabel, step, xAxisData, yAxisData, barColor) {
        super.setData(chartTitle, xAxisLabel, yAxisLabel, step, xAxisData, yAxisData, barColor);
        return this;
    }

    example() {
        super.setData("Motor Vehicle Deaths by Month (2021)", "Month", "Deaths", 1000, 4, 
            ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            [3099, 2561, 3214, 3557, 3768, 3789, 3879, 4013, 3861, 4101, 3599, 3498], '#4285f4'
        )
        return this;
    }
}

export class LineChart extends Chart {
    /**
     * @param {string} element        element to append the chart to
     * @param {object} options        options for the chart
     * @param {number} options.width  width of the chart
     * @param {number} options.height height of the chart
     */
    constructor(element, options) {
        super('line').appendTo(element, options)
    }

    /**
     * @class LineChart
     * @memberof Chart
     * @param {string}            chartTitle title of the chart
     * @param {string}            xAxisLabel label for the x axis
     * @param {string}            yAxisLabel label for the y axis
     * @param {number}            xStep      step value for the x axis
     * @param {number}            yStep      step value for the y axis
     * @param {object[]}          data       the data for the line chart
     * @param {string}            data[].color color of the line
     * @param {string}            data[].label label for the line
     * @param {number}            data[].pointRadius radius of the points
     * @param {number}            data[].lineWidth width of the line
     * @param {number}            data[].hoverPointRadius radius of the hover points
     * @param {boolean}           data[].pointLabels whether or not to show the point labels
     * @description Has trouble with extremely small numbers (<0)
     * @example
        let line = new Chart('line')
        .appendTo('#line-chart')
        .setData("Average Stock Prices (2000 - 2022)", 'Year', 'Price', 1, 10, [
            {
                color: 'red',
                label: 'Apple',
                pointRadius: 1,
                lineWidth: 2,
                hoverPointRadius: 4,
                pointLabels: true,
                points: [
                    [2000, 0.6937],
                    [2001, 0.3068],
                    [2002, 0.2905],
                    [2003, 0.2814],
                    [2004, 0.5391],
                    [2005, 1.4167],
                    [2006, 2.1492],
                    [2007, 3.8933],
                    [2008, 4.3092],
                    [2009, 4.4560],
                    [2010, 7.8866],
                    [2011, 11.0480],
                    [2012, 17.5266],
                    [2013, 14.6700],
                    [2014, 20.5310],
                    [2015, 27.1667],
                    [2016, 24.1638],
                    [2017, 35.4349],
                    [2018, 45.1771],
                    [2019, 50.5541],
                    [2020, 93.6424],
                    [2021, 139.3947],
                    [2022, 153.9328],
                ],
            }, {
                color: 'blue',
                label: 'Microsoft',
                pointRadius: 2,
                lineWidth: 1,
                hoverPointRadius: 4,
                pointLabels: false,
                points: [
                    [2000, 23.8554],
                    [2001, 19.5747],
                    [2002, 17.0729],
                    [2003, 16.4050],
                    [2004, 17.3987],
                    [2005, 18.3417],
                    [2006, 18.8863],
                    [2007, 22.1793],
                    [2008, 19.6798],
                    [2009, 17.3973],
                    [2010, 20.8738],
                    [2011, 20.5793],
                    [2012, 24.2010],
                    [2013, 27.1941],
                    [2014, 36.5584],
                    [2015, 41.2965],
                    [2016, 50.1958],
                    [2017, 67.0252],
                    [2018, 95.8759],
                    [2019, 125.5735],
                    [2020, 187.8096],
                    [2021, 271.0883],
                    [2022, 266.2800],
                ],
            }
        ])
    */
    setData(chartTitle, yAxisLabel, xAxisLabel, xStep, yStep, data){
        super.setData(chartTitle, yAxisLabel, xAxisLabel, xStep, yStep, data)
        return this;
    }

    example(){
        super.setData("Average Stock Prices (2000 - 2022)", 'Year', 'Price', 2, 10, [
            {
                color: 'red',
                label: 'Apple',
                pointRadius: 5,
                lineWidth: 2,
                hoverPointRadius: 7,
                pointLabels: true,
                points: [
                    [2000, 0.6937],
                    [2001, 0.3068],
                    [2002, 0.2905],
                    [2003, 0.2814],
                    [2004, 0.5391],
                    [2005, 1.4167],
                    [2006, 2.1492],
                    [2007, 3.8933],
                    [2008, 4.3092],
                    [2009, 4.4560],
                    [2010, 7.8866],
                    [2011, 11.0480],
                    [2012, 17.5266],
                    [2013, 14.6700],
                    [2014, 20.5310],
                    [2015, 27.1667],
                    [2016, 24.1638],
                    [2017, 35.4349],
                    [2018, 45.1771],
                    [2019, 50.5541],
                    [2020, 93.6424],
                    [2021, 139.3947],
                    [2022, 153.9328],
                ],
            }, {
                color: 'blue',
                label: 'Microsoft',
                pointRadius: 2,
                lineWidth: 1,
                hoverPointRadius: 4,
                pointLabels: false,
                points: [
                    [2000, 23.8554],
                    [2001, 19.5747],
                    [2002, 17.0729],
                    [2003, 16.4050],
                    [2004, 17.3987],
                    [2005, 18.3417],
                    [2006, 18.8863],
                    [2007, 22.1793],
                    [2008, 19.6798],
                    [2009, 17.3973],
                    [2010, 20.8738],
                    [2011, 20.5793],
                    [2012, 24.2010],
                    [2013, 27.1941],
                    [2014, 36.5584],
                    [2015, 41.2965],
                    [2016, 50.1958],
                    [2017, 67.0252],
                    [2018, 95.8759],
                    [2019, 125.5735],
                    [2020, 187.8096],
                    [2021, 271.0883],
                    [2022, 266.2800],
                ],
            }
        ])

        return this;
    }
}