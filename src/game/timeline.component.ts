import { Component, Input, OnChanges, ElementRef, ViewChild } from '@angular/core';
import * as D3 from 'd3';

import { Stage, GameHero, GameEvent, Player, KillFeedEntry, PayloadObjectiveInfo } from './game.service';


@Component({
    selector: 'timeline',
    templateUrl: './timeline.component.html'
})
export class TimelineComponent implements OnChanges {
    @Input() stage: Stage;
    @ViewChild('timelineBody') element: ElementRef;

    private host: D3.Selection<HTMLElement, {}, undefined, any>;

    ngOnChanges() {
        this.host = D3.select(this.element.nativeElement);
        
        const players = this.host.select('.timeline-players').selectAll('div')
            .data(this.stage.players).enter();
        const div = players.append('div').attr('class', 'col-xs-12');
        div.style('padding-bottom', (player: Player, i: number) =>
                 i === 5 ? '10px' : '0px');
        // Add name
        div.append('b')
            .attr('class', (player: Player) => {
                return 'col-xs-2 text-right text-' + player.colour + (player.name.indexOf('@') != -1 ? ' too-long' : '');
            }).text((player: Player) => player.name);

        const svg = div.append('svg')
            .attr('class', 'timeline col-xs-9');
        
        svg.append('rect')
            .attr('width', '100%')
            .attr('height', '40px')
            .attr('fill', 'gray')
            .attr('stroke', 'white');

        svg.selectAll('.timeline-event .destroyed').data((player: Player) => player.events.filter(event => event.type == 'destroyed'))
            .enter().append('image')
            .attr('class', (event: GameEvent) => 'timeline-event destroyed ' + event.id)
            .attr('xlink:href','assets/images/timeline/explosion.png')
            .attr('x', (event: GameEvent) => this.x(event.time) + '%')
            .attr('transform', 'translate(-6)')
            .attr('y', 12)
            .attr('width', 15)
            .attr('height', 15)
            .attr('data-other', (event: GameEvent) => event.other)
            .attr('data-type', (event: GameEvent) => event.type)
            .attr('data-timestamp', (event: GameEvent) => event.absoluteTime);

        svg.selectAll('.timeline-event .destruction').data((player: Player) => player.events.filter(event => event.type == 'destruction'))
            .enter().append('text')
            .attr('class', (event: GameEvent) => 'timeline-event destruction ' + event.id)
            .attr('x', (event: GameEvent) => this.x(event.time) + '%')
            .attr('y', 26)
            .attr('data-other', (event: GameEvent) => event.other)
            .attr('data-type', (event: GameEvent) => event.type)
            .attr('data-timestamp', (event: GameEvent) => event.absoluteTime)
            .text('*');

        svg.selectAll('.hero-image').data((player: Player) => player.heroesPlayed)
            .enter().append('image')
            .attr('xlink:href',
                  (hero: GameHero) => 'assets/images/heroes/' + hero.name + '.png')
            .attr('x', (hero: GameHero) => this.x(hero.start) + '%')
            .attr('class', 'hero-image')
            .attr('width', 40)
            .attr('height', 40)
            .attr('y', 0)
            .attr('data-timestamp', (hero: GameHero) => hero.start);

        svg.selectAll('.timeline-event .assist, .timeline-event .support-assist')
            .data((player: Player) => player.events.filter(event => event.type == 'assist' || event.type == 'support-assist'))
            .enter().append('text')
            .attr('class', (event: GameEvent) => 'timeline-event ' + event.type + ' ' + event.id)
            .attr('x', (event: GameEvent) => this.x(event.time) + '%')
            .attr('y', 20)
            .attr('data-other', (event: GameEvent) => event.other)
            .attr('data-type', (event: GameEvent) => event.type)
            .attr('data-timestamp', (event: GameEvent) => event.absoluteTime)
            .text('●');

        svg.selectAll('.timeline-event .ability-assist')
            .data((player: Player) => player.events.filter(event => event.type == 'ability-assist'))
            .enter().append('text')
            .attr('class', (event: GameEvent) => 'timeline-event ' + event.type + ' ' + event.id)
            .attr('x', (event: GameEvent) => this.x(event.time) + '%')
            .attr('y', 20)
            .attr('data-other', (event: GameEvent) => event.other)
            .attr('data-type', (event: GameEvent) => event.type)
            .attr('data-timestamp', (event: GameEvent) => event.absoluteTime)
            .text('●');

        svg.selectAll('.timeline-event .kill').data((player: Player) => player.events.filter(event => event.type == 'kill'))
            .enter().append('text')
            .attr('class', (event: GameEvent) => 'timeline-event kill ' + event.id)
            .attr('x', (event: GameEvent) => this.x(event.time) + '%')
            .attr('y', 20)
            .attr('data-other', (event: GameEvent) => event.other)
            .attr('data-type', (event: GameEvent) => event.type)
            .attr('data-timestamp', (event: GameEvent) => event.absoluteTime)
            .text('●');

        svg.selectAll('.timeline-event .death').data((player: Player) => player.events.filter(event => event.type == 'death'))
            .enter().append('image')
            .attr('class', (event: GameEvent) => 'timeline-event death ' + event.id)
            .attr('xlink:href','assets/images/timeline/skull.png')
            .attr('x', (event: GameEvent) => this.x(event.time) + '%')
            .attr('transform', 'translate(-6)')
            .attr('y', 12)
            .attr('width', 15)
            .attr('height', 15)
            .attr('data-other', (event: GameEvent) => event.other)
            .attr('data-type', (event: GameEvent) => event.type)
            .attr('data-timestamp', (event: GameEvent) => event.absoluteTime);

        svg.selectAll('.timeline-event .death').data((player: Player) => player.events.filter(event => event.type == 'resurrect'))
            .enter().append('image')
            .attr('class', (event: GameEvent) => 'timeline-event resurrect ' + event.id)
            .attr('xlink:href','assets/images/timeline/res.png')
            .attr('x', (event: GameEvent) => this.x(event.time) + '%')
            .attr('transform', 'translate(-6)')
            .attr('y', 9)
            .attr('width', 20)
            .attr('height', 20)
            .attr('data-other', (event: GameEvent) => event.other)
            .attr('data-type', (event: GameEvent) => event.type)
            .attr('data-timestamp', (event: GameEvent) => event.absoluteTime);
        
        // Add the kills and deaths
        const b = div.append('b')
            .attr('class', 'col-xs-1 text-left num');
        b.append('span').attr('class', 'kill')
            .text((player: Player) => player.kills);
        b.append('span')
            .text((player: Player) => ' / ');
        b.append('span').attr('class', 'death')
            .text((player: Player) => player.deaths);
        
        const time = this.host.select('.timeline-players')
            .insert('div',':first-child').attr('class', 'col-xs-12');
        time.append('div').attr('class', 'col-xs-2');
        const timelineTickSvg = time.append('svg')
            .attr('height', 20)
            .attr('class', 'col-xs-10')
            .style('padding', 0)
            .attr('overflow', 'visible');
        
        const scale = D3.scaleLinear()
            .domain([0, (this.stage.end - this.stage.start) / 1000])
            .range([0, (svg.node() as any).getBoundingClientRect().width-1]);

        const axis = D3.axisTop(scale);
        axis.ticks(7);
        axis.tickFormat((d: number) => {
            const min = D3.format('d')(Math.floor(d / 60));
            const sec = D3.format('02d')(d - (Math.floor(d / 60) * 60));
            return min + ':' + sec;
        });

        // Only add a tick for the end value if the previous tick is far enough away
        let ticks = scale.ticks(7);
        if (ticks[ticks.length - 1] < scale.domain()[1] * 0.95){
            axis.tickValues(scale.ticks(7).concat(scale.domain()[1]));
        }
        
        const timelineAxis = timelineTickSvg.append('g').attr('transform','translate(0,19)').call(axis);
        timelineAxis.selectAll('text').attr('fill','white');
        timelineAxis.selectAll('path').attr('stroke','white');
        timelineAxis.selectAll('line').attr('stroke','white');

        const timelineAxis2 = timelineTickSvg.append('g').attr('transform','translate(0,19)').call(axis);
        timelineAxis2.selectAll('text').attr('fill','white');
        timelineAxis2.selectAll('path').attr('stroke','white');
        timelineAxis2.selectAll('line').attr('stroke','white');
        
        // hack hack hack
        window.setTimeout(e =>{
            D3.selectAll(".timeline-event")
                .on("mouseover", this.mouseOverTimelineEvent)
                .on("mouseout", this.mouseOutTimelineEvent);
            
            D3.selectAll("svg .timeline-event")
                .on("click", this.scrollKillfeed);
        }, 0);
    }
    
    scrollKillfeed() {
        //Find the id of the event by searching through the classes of the current element
        let classes: Array<String> = D3.select(this as any).attr('class').split(" ");
        let eventId = null;
        for (const cls of classes) {
            if (cls.startsWith("event")) {
                eventId = cls;
                break;
            }
        }
        //Get the killfeed for the stage. TODO: Add class or something to identify killfeeds by stage
        let parent = D3.select((this as any).parentNode.parentNode.parentNode.parentNode.parentNode);
        let killfeed = parent.select('#killfeed');
        
        let target = killfeed.select('.' + eventId);
        if (target.node()){
            let toffset = (target.node() as any).getBoundingClientRect().top - 431;
            console.log(toffset,  (killfeed.node() as any).scrollTop);
            if (toffset < 0 || toffset > 475) {        
                (killfeed.node() as any).scrollTop += toffset - 100;
            }
        }
    }
     
    mouseOverTimelineEvent() {
        //Find the id of the event by searching through the classes of the current element
        let classes: Array<String> = D3.select(this as any).attr('class').split(" ");
        let eventId = null;
        for (const cls of classes) {
            if (cls.startsWith("event")) {
                eventId = cls;
                break;
            }
        }
        let isKillFeed = (this as any).tagName.toLowerCase() === "tr";

        if (isKillFeed) {
            D3.selectAll("svg .timeline-event:not(." + eventId + ")").classed('faded', true);
            D3.selectAll("tr.timeline-event:not(." + eventId + ")").classed('slight-faded', true);
        } else {
            D3.selectAll(".timeline-event:not(." + eventId + ")").classed('faded', true);
        }

        D3.selectAll(".timeline-event." + eventId).classed('highlighted', true);
    }
     
    mouseOutTimelineEvent() {
        D3.selectAll(".timeline-event").classed('faded', false);
        D3.selectAll(".timeline-event").classed('slight-faded', false);
        D3.selectAll(".timeline-event").classed('highlighted', false);
    }
     

    widthPercentage(hero: GameHero) {
        return 100 * (hero.end - hero.start) / (this.stage.end - this.stage.start);
    }

    x(time: number) {
        return 100 * time / (this.stage.end - this.stage.start);
    }

    eventLeft(event: GameEvent) {
        return 100 * Math.min(event.time / (this.stage.end - this.stage.start), 1);
    }
     
    stageTime(event: GameEvent) {
        const time = Math.floor(event.time / 1000);
        const min = D3.format('d')(Math.floor(time / 60));
        const sec = D3.format('02')(time - (Math.floor(time / 60) * 60));
        return min + ':' + sec;
    }   
     
    leftColor(kill: KillFeedEntry) {
        if (kill.isLeftRed) {
            return 'text-red';
        }
        return 'text-blue';
    }

    rightColor(kill: KillFeedEntry) {
        let isBlue = kill.isLeftRed && !kill.isRes || !kill.isLeftRed && kill.isRes; 
        if (isBlue) {
            return 'text-blue';
        }
        return 'text-red';
    }
     
     tooLong(name: String): String {
         if (name && name.length > 12) {
             return "too-long"
         }
         return "";
     }

    time(kill: KillFeedEntry) {
        let time = kill.time - this.stage.start;
        let secs = Math.floor(time / 1000);
        let mins = Math.floor(secs / 60);
        secs = secs - 60 * mins;
        let secd = secs < 10 ? '0' + secs : secs;
        return mins + ':' + secd;
    }
     
    endTime() {
        const time = Math.floor((this.stage.end - this.stage.start) / 1000);
        const min = D3.format('d')(Math.floor(time / 60));
        const sec = D3.format('02')(time - (Math.floor(time / 60) * 60));
        return min + ':' + sec;
    }

    isKOTH() {
        return 'ownership' in this.stage.objectiveInfo;
    }

    pushingEvents(events: any) {
        if (!events){
            return [];
        }
        return events.filter(e => e.type == 'pushing' && e.end - e.start > 3 * 1000);
    }

    tickEvents(events: any){
        if (!events){
            return [];
        }
        let filteredEvents: Array<any> = [];
        for (let e of events){
            if (e.type != 'tick'){
                continue;
            }
            if (e.time - this.stage.start < 25 * 1000 || this.stage.end - e.time < 25 * 1000){
                // too close to start or end
                continue;
            }
            let objectiveInfo = <PayloadObjectiveInfo>this.stage.objectiveInfo;
            let valid = true;
            for (let checkpoint of objectiveInfo.checkpoints){
                if (Math.abs((checkpoint.time + this.stage.start ) - e.time) < 25 * 1000){
                    valid = false;
                    break;
                }
            }
            if (!valid){
                continue;
            }

            filteredEvents.push(e);
        }
        return filteredEvents;
    }

    pushingWidthPercentage(event){
        return 100 * (event.end - event.start) / (this.stage.end - this.stage.start);
    }
}
