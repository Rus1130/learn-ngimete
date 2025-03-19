import { Chart } from '../main.js';
import { PathArray } from 'https://cdnjs.cloudflare.com/ajax/libs/svg.js/3.1.2/svg.esm.js';

export class LineChart_ {
    constructor(chartTitle, yAxisLabel, xAxisLabel, xStep, yStep, data){
        if(yStep <= 0) return console.error(new Error('yStep must be greater than 0'))
        if(xStep <= 0) return console.error(new Error('xStep must be greater than 0'))
        let draw = Chart.draw
        this.data = data;

        let xLine = Chart.measureLines.xAxisLine;
        let yLine = Chart.measureLines.yAxisLine;

        let xCenter = Chart.measureLines.xCenterLine;
        let yCenter = Chart.measureLines.yCenterLine;

        this.error = false;
        
        // X Axis Label
        let xLabel = draw.text(xAxisLabel).font({ family: 'Helvetica', size: 16 })
        .cx(xLine.attr('x1') + (xLine.attr('x2') - xLine.attr('x1')) / 2)
        .cy(Chart.options.height - (Chart.options.height - xLine.attr('y1')) / 2)

        // Y Axis Label
        let yLabel = draw.text(yAxisLabel).font({ family: 'Helvetica', size: 16 })
        .cx((yLine.attr('x2') / 2 - yLine.attr('x1') / 4) + 3)
        .cy(yLine.attr('y1') - (yLine.attr('y1') - yLine.attr('y2')) / 2)
        .rotate(-90)

        let yData = []
        let xData = []
        for(let i = 0; i < data.length; i++){
            for(let j = 0; j < data[i].points.length; j++){
                yData.push(Math.round(data[i].points[j][1] * 100) / 100)
                xData.push(data[i].points[j][0])
            }
        }
        
        let yMax = Math.max(...yData)
        let yMin = Math.min(...yData)
        let yMeasureStep = (yLine.attr('y1') - yLine.attr('y2')) / (yMax - yMin)

        let xMax = Math.max(...xData)
        let xMin = Math.min(...xData)
        let xMeasureStep = (xLine.attr('x2') - xLine.attr('x1')) / (xMax - xMin)

        let xLabelText = [];
        let yLabelText = [];

        let xLabels = [];
        let yLabels = [];

        let xTickLines = [];
        let yTickLines = [];

        let yMeasureLines = []

        for(let i = 0; i < xMax - xMin + 1; i++){
            try {
                xLabelText.push(Math.round((xMin + i) * 100) / 100)
            } catch(e) {
                console.error(new Error('number too large;'));
                this.error = true;
            }
        }

        for(let i = 0; i < yMax - yMin + 1; i++){
            try {
                yLabelText.push(Math.round((yMin + i) * 100) / 100)
            } catch(e) {
                console.error(new Error('number too large;'));
                this.error = true;
            }   
        }

        if(this.error) return;
        
        for(let i = 0; i < xLabelText.length; i++){
            if(i % xStep !== 0) continue;
            let x = (xLine.attr('x1') + xMeasureStep * (xLabelText[i] - xMin)) //+ xMeasureStep/2
            let y = xLine.attr('y1')
            let line = draw.line(x, y, x, y + 5).stroke({ width: 1, color: '#8e8e8e' })

            let text = draw.text(xLabelText[i]).font({ family: 'Helvetica', size: 10, color: "black" });

            text.x(x - text.bbox().width / 2)
            .y(y + 10)
            .rotate(-45)

            xTickLines.push(line)
            xLabels.push(text)
        }

        for(let i = 0; i < yLabelText.length; i++){
            if(i % yStep !== 0) continue;
            let x = yLine.attr('x1')
            let y = yLine.attr('y2') + yMeasureStep * i

            let measureLine = draw.line(x, y, xLine.attr('x2'), y).stroke({ width: 1, color: '#dcdcdc' })
            let line = draw.line(x + 5, y, x - 5, y).stroke({ width: 1, color: '#000' })
            let text = draw.text(yLabelText[i]).font({ family: 'Helvetica', size: 10, color: "black" });

            text.x(x - text.bbox().width - 10)
            .y(y - text.bbox().height / 2)

            yTickLines.push(line)
            yMeasureLines.push(measureLine)
            yLabels.push(text)
        }

        // points
        let points = []
        let hoverPoints = [];
        for(let i = 0; i < data.length; i++){
            points.push([])
            for(let j = 0; j < data[i].points.length; j++){
                try {
                    let x = xTickLines[0].attr('x1') + xMeasureStep * (data[i].points[j][0] - xMin)
                    let y = yTickLines[0].attr('y1') + yMeasureStep * (data[i].points[j][1] - yMin)

                    let point = draw.circle(data[i].pointRadius).fill(data[i].color)
                    .cx(x)
                    .cy(y)

                    let hoverPoint = draw.circle(data[i].hoverPointRadius).fill('transparent')
                    .cx(x)
                    .cy(y)

                    let hoverText = draw.text(data[i].points[j][1]).font({ family: 'Helvetica', size: 12 })
                    .cx(point.attr('cx')).cy(point.attr('cy') - (data[i].hoverPointRadius + 4)).fill('black')

                    let guideLine = draw.line(point.attr('cx'), point.attr('cy'), point.attr('cx'), yLine.attr('y2')).stroke({ width: 1, color: "#dcdcdc" })

                    let guideLineXText = draw.text(data[i].points[j][0]).font({ family: 'Helvetica', size: 12 })
                    guideLineXText.x(point.attr('cx') + 1).y(yLine.attr('y2') - guideLineXText.bbox().height).fill('black')

                    guideLine.hide()
                    hoverText.hide()
                    guideLineXText.hide()

                    hoverPoint.cx(point.attr('cx'))
                    hoverPoint.cy(point.attr('cy'))

                    hoverPoint.on("mouseenter",function() {
                        if(data[i].pointLabels) {
                            hoverText.show()
                            guideLine.show()
                            if(j % xStep !== 0) guideLineXText.show()
                        }
                        hoverPoint.fill(data[i].color)
                    });

                    hoverPoint.on("mouseleave",function() {
                        if(data[i].pointLabels) {
                            hoverText.hide()
                            guideLine.hide()
                            guideLineXText.hide()
                        }
                        hoverPoint.fill('transparent')
                    });

                    hoverPoints.push(hoverPoint)

                    points[points.length - 1].push(point)
                } catch(e) {
                    if(xTickLines[0] == undefined) console.error(new Error('x value out of bounds; lower xStep'));
                    if(yTickLines[0] == undefined) console.error(new Error('y value out of bounds; lower yStep'));

                    this.error = true;
                }
            }
        }

        if(this.error) return console.error(new Error('Error: x or y value out of bounds'));

        for(let i = 0; i < data.length; i++){
            let path = draw.path().fill('none').stroke({ width: data[i].lineWidth, color: data[i].color })
            let pathString = `M ${points[i][0].attr('cx')} ${points[i][0].attr('cy')} `

            for(let j = 1; j < points[i].length; j++){
                pathString += `L ${points[i][j].attr('cx')} ${points[i][j].attr('cy')} `
            }

            path.plot(pathString)
        }

        hoverPoints.forEach(point => {
            point.front()
        })

        for(let i = 0; i < data.length; i++){
            let legend = draw.rect(20, 20).fill(data[i].color)
            .x(xLine.attr('x2') + 10)
            .y(yLine.attr('y1') + 30 * i)
            .radius(2)

            draw.text(data[i].label).font({ family: 'Helvetica', size: 12 })
            .x(xLine.attr('x2') + 10 + legend.bbox().width + 5)
            .y(yLine.attr('y1') + 30 * i + legend.bbox().height / 2 - 6)
        }

        
        // title
        Chart.setTitle(draw, chartTitle);
    }
}