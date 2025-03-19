import { Chart } from '../main.js';

export class PieChart_ {
    constructor(chartTitle, data, options) {
        const opts = options || {};
        const popAmount = opts.popAmount || 0;
        const showPercentages = opts.showPercentages || false;
        const donut = opts.donut || false;
        const sliceOutlineWidth = opts.sliceOutlineWidth || 0;
        const sliceOutlineColor = opts.sliceOutlineColor || 'transparent';

        this.science = {};

        function getD(radius, startAngle, endAngle) {
            const isCircle = endAngle - startAngle === 360;
            if (isCircle) {
                endAngle--;
            }
            const start = polarToCartesian(radius, startAngle);
            const end = polarToCartesian(radius, endAngle);
            const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
            const d = [
                "M", start.x, start.y,
                "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
            ];

            if (isCircle) {
                d.push("Z");
            } else {
                d.push("L", radius, radius, "L", start.x, start.y, "Z");
            }
            return d.join(" ");
        }

        function polarToCartesian(radius, angleInDegrees) {
            var radians = (angleInDegrees - 90) * Math.PI / 180;
            return {
                x: radius + (radius * Math.cos(radians)),
                y: radius + (radius * Math.sin(radians))
            };
        }

        let draw = Chart.draw
        this.data = data;

        let totalArc = 0;
        for(let i = 0; i < data.length; i++){
            totalArc += data[i].arc;
        }
        
        // if(totalArc > 100) {
        //     return console.error(new Error('The total arc of the pie chart cannot exceed 100%'))
        // }

        // this.data.sort((a, b) => {
        //     return b.arc - a.arc;
        // })

        let circle = Chart.measureLines.circle;
        let arcs = [];
        let colors = [];
        let labels = [];

        for(let i = 0; i < data.length; i++){
            arcs.push(data[i].arc * 3.6);
            colors.push(data[i].color);
            labels.push(data[i].label);
        }

        this.science.arcs = arcs;
        this.science.colors = colors;
        this.science.labels = labels;

        let arcList = []
        let donutArcList = [];
        let labelElements = []
        for(let i = 0; i < arcs.length; i++){
            let startingAngle = 0;
            for(let j = 0; j < i; j++){
                startingAngle += arcs[j];
            }
            
            let endAngle = startingAngle + arcs[i];

            let arc = draw.path(getD(circle.attr('r'), startingAngle, endAngle)).fill(colors[i])
            .dx(circle.attr('cx') - circle.attr('r'))
            .dy(circle.attr('cy') - circle.attr('r'))
            .stroke({ width: sliceOutlineWidth, color: sliceOutlineColor })

            if(donut) {
                let donutArc = draw.path(getD(circle.attr('r') * 0.5, startingAngle, endAngle)).fill("white")
                .dx(circle.attr('cx') - circle.attr('r') * 0.5)
                .dy(circle.attr('cy') - circle.attr('r') * 0.5)
                .stroke({ width: sliceOutlineWidth+1, color: "#ffffff" })

                donutArcList.push(donutArc)
            }


            arcList.push(arc);
        }

        this.science.arcList = arcList;
        this.science.donutArcList = donutArcList;
        this.science.labelElements = labelElements;

        for(let i = 0; i < arcList.length; i++){
            let percentage = Math.round((Math.round(arcs[i] / 360 * 10000) / 10000) * 100) * 10000 / 10000

            let label = labels[i]

            if(showPercentages) label += ` (${percentage}%)`

            let angle = 0;
            for(let j = 0; j < i; j++){
                angle += arcs[j];
            }

            angle += arcs[i] / 2;

            let text = draw.text(label).font({ family: 'Helvetica', size: 12 })
            .cx(circle.attr('cx'))
            .cy(circle.attr('cy')/2 - 35)

            text.rotate(angle, circle.attr('cx'), circle.attr('cy'))
            text.rotate(-angle)

            arcList[i].remember('originalX', arcList[i].x())
            arcList[i].remember('originalY', arcList[i].y())

            if(donut) {
                donutArcList[i].remember('originalX', donutArcList[i].x())
                donutArcList[i].remember('originalY', donutArcList[i].y())
            }

            text.remember('originalX', text.x())
            text.remember('originalY', text.y())

            arcList[i].on('mouseenter', function() {
                arcList[i].animate(100)
                .dx(circle.attr('cx') - Math.cos((angle + 90) * Math.PI / 180) * popAmount - circle.attr('r') * 2)
                .dy(circle.attr('cy') - Math.sin((angle + 90) * Math.PI / 180) * popAmount - circle.attr('r') * 2)

                if(donut) {
                    let halfR = circle.attr('r') * 0.5

                    donutArcList[i].animate(100)
                    .dx((circle.attr('cx') - Math.cos((angle + 90) * Math.PI / 180) * popAmount - halfR * 2) - circle.attr('r'))
                    .dy((circle.attr('cy') - Math.sin((angle + 90) * Math.PI / 180) * popAmount - halfR * 2) - circle.attr('r'))
                }



                text.animate(100)
                .dx(circle.attr('cx') - Math.cos((angle + 90) * Math.PI / 180) * popAmount - circle.attr('r') * 2)
                .dy(circle.attr('cy') - Math.sin((angle + 90) * Math.PI / 180) * popAmount - circle.attr('r') * 2)


            })

            arcList[i].on('mouseleave', function() {
                arcList[i].animate(100)
                .x(arcList[i].remember('originalX'))
                .y(arcList[i].remember('originalY'))

                if(donut) {
                    donutArcList[i].animate(100)
                    .x(donutArcList[i].remember('originalX'))
                    .y(donutArcList[i].remember('originalY'))
                }

                text.animate(100)
                .x(text.remember('originalX'))
                .y(text.remember('originalY'))
            })

            labelElements.push(text)
        }

        // title
        Chart.setTitle(draw, chartTitle);
    }
}