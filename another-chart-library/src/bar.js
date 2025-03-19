import { Chart } from '../main.js';

export class BarChart_ {
    constructor(chartTitle, xAxisLabel, yAxisLabel, step, density, xAxisData, yAxisData, barColor) {
        let draw = Chart.draw

        barColor = barColor || '#4285f4';

        if(xAxisData.length !== yAxisData.length) throw new Error('xAxis and yAxis data must be the same length')

        let xLine = Chart.measureLines.xAxisLine;
        let yLine = Chart.measureLines.yAxisLine;

        let yCenter = Chart.measureLines.yCenterLine;

        yLine.attr('x1', 50)
        yLine.attr('x2', 50)

        xLine.hide();

        // X Axis Label
        let xLabel = draw.text(xAxisLabel).font({ family: 'Helvetica', size: 16 })
        .cx(xLine.attr('x1') + (xLine.attr('x2') - xLine.attr('x1')) / 2)
        .cy(Chart.options.height - (Chart.options.height - xLine.attr('y1')) / 2)

        // Y Axis Label
        draw.text(yAxisLabel).font({ family: 'Helvetica', size: 16 })
        .cx(yLine.attr('x2') / 2 - yLine.attr('x1') / 4)
        .cy(yLine.attr('y1') - (yLine.attr('y1') - yLine.attr('y2')) / 2)
        .rotate(-90)

        let heights = []
        for(let i = 0; i < yAxisData.length; i++){
            heights.push(yAxisData[i])
        }

        let max = Math.max(...heights) + (step - (Math.max(...heights) % step))

        let measureStep = (yLine.attr('y1') - yLine.attr('y2')) / max

        function drawBar(height, x, width, barLabel) {
            let rect = draw.rect(width, -measureStep * height)
            .x(yLine.attr('x1') + x)
            .y(xLine.attr('y1') + measureStep * height)

            rect.attr('fill', barColor)

            // Label Text
            draw.text(barLabel).font({ family: 'Helvetica', size: 12 })
            .cx(rect.attr('x') + rect.attr('width') / 2)
            .cy(xLine.attr('y1') + 10)

            // when hovered over for 1 second, show the value

            let text = draw.text().tspan(height).fill('transparent').font({ family: 'Helvetica', size: 12 })
            .cx(rect.attr('x') + rect.attr('width') / 2)
            .cy(rect.attr('y') - 10)


            text.fill('#000000')
        }   

        

        for(let i = 0; i <= max; i += (step / (density + 1))) {
            let measureLine = draw.line(yLine.attr('x1') - 5, xLine.attr('y1') + measureStep * i, yLine.attr('x1') + 5, xLine.attr('y2') + measureStep * i)
            .stroke({ width: 1, color: '#000' })

            if(i % step == 0) {
                measureLine.attr('x1', measureLine.attr('x1') - 1.5)
                measureLine.attr('x2', measureLine.attr('x2') + 1.5)

                let text = draw.text(i).font({ family: 'Helvetica', size: 12 })
                text.x(measureLine.attr('x1') - text.bbox().width - 2)
                .cy(xLine.attr('y1') + measureStep * i)
            } else {
                let text = draw.text().tspan(i).fill('#5C5858').font({ family: 'Helvetica', size: 8 })
                text.x(measureLine.attr('x1') - text.bbox().width - 2)
                .cy(xLine.attr('y1') + measureStep * i)
            }

            // horizontal lines
            draw.line(measureLine.attr('x2'), measureLine.attr('y1'), xLine.attr('x2'), measureLine.attr('y1'))
            .stroke({ width: 1, color: '#DCDCDC' })
        }

        let barPositionStep = ((yCenter.attr('x2') - yCenter.attr('x1')) / xAxisData.length) - 4

        for(let i = 0; i < xAxisData.length; i++){
            drawBar(yAxisData[i], barPositionStep * i + 18, barPositionStep - 18, xAxisData[i])
        }

        // title
        Chart.setTitle(draw, chartTitle);
    }
}