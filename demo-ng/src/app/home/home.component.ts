import { Component, OnInit } from '@angular/core';
import { mdiFontFamily } from '../../variables';

interface Item {
    [key: string]: any;
}

@Component({
    selector: 'Home',
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
    items: Item[] = [];
    mdiFontFamily = mdiFontFamily;

    constructor() {
        // Use the component constructor to inject providers.
    }

    ngOnInit(): void {
        const randomLanguage = ['javascript', 'typescript', 'go', 'c++'];
        const items = new Array(1000).fill(null).map((v, i) => ({
            index: i,
            // icon1: icons[Math.round(Math.random() * (icons.length - 1))],
            icon1: '1',
            icon2: 'mdi-access-point',
            icon3: '3',
            texticon1: randomLanguage[Math.round(Math.random() * (randomLanguage.length - 1))] + ` ${i}`,
            texticon2: randomLanguage[Math.round(Math.random() * (randomLanguage.length - 1))] + ` ${i}`,
            texticon3: randomLanguage[Math.round(Math.random() * (randomLanguage.length - 1))] + ` ${i}`,
            text1: `test asd g ${i}`,
            text2: 'asddg',
            text3: `icon ${i}`,
            text4: i % 3 === 0 ? 'test' : ''
        }));

        this.items = items;
    }

    onItemTap({ index, item }) {
        console.log(`Tapped on ${index} ${item.title}`);
    }
}
