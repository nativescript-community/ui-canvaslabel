<template>
    <Page>
        <StackLayout>
            <CollectionView width="100%" height="100%" rowHeight="80" ref="listView" :items="itemList" @itemTap="onItemTap" itemIdGenerator="index">
                <v-template>
                    <CanvasLabel id="canvaslabel" fontSize="10" color="white" backgroundColor="darkgray">
                        <CGroup fontSize="18" verticalAlignment="middle" paddingLeft="20">
                            <CSpan :text="item.text1" fontWeight="bold" />
                            <CSpan :text="'\n' + item.text2" color="#ccc" fontSize="16" />
                        </CGroup>

                        <CGroup fontSize="12" verticalAlignment="bottom" paddingLeft="20" paddingBottom="1">
                            <CSpan :text="item.icon1" fontSize="20" color="green" :fontFamily="mdiFontFamily" />
                            <CSpan :text="' ' + item.texticon1" verticalTextAlignment="center" />
                            <CSpan :text="'   ' + item.icon2" fontSize="20" color="red" :fontFamily="mdiFontFamily" />
                            <CSpan :text="' ' + item.texticon2" verticalTextAlignment="center" />
                            <CSpan :text="'   ' + item.icon3" fontSize="20" color="yellow" :fontFamily="mdiFontFamily" />
                            <CSpan :text="' ' + item.texticon3" verticalTextAlignment="center" />
                        </CGroup>

                        <CGroup fontSize="12" verticalAlignment="middle" horizontalAlignment="center" textAlignment="right" paddingRight="20" color="brown" width="60">
                            <CSpan :text="item.icon1" fontSize="14" :fontFamily="mdiFontFamily" />
                            <CSpan :text="'\n' + item.texticon1" paddingRight="10" />
                        </CGroup>
                        <CSpan :text="item.text4" color="lightgray" fontSize="14" textAlignment="right" paddingRight="20" paddingTop="4" />
                    </CanvasLabel>
                    <!-- <GridLayout backgroundColor="darkgray">
                        <label fontSize="18" verticalAlignment="middle" paddingLeft="20"  whiteSpace="true">
                            <span :text="item.text1" fontWeight="bold" />
                            <span :text="'\n' + item.text2" color="#ccc" fontSize="16" />
                        </label>

                        <label fontSize="12" verticalAlignment="bottom" paddingLeft="20" paddingBottom="1">
                            <span :text="item.icon1" fontSize="20" color="green" :fontFamily="mdiFontFamily" />
                            <span :text="' ' + item.texticon1" verticalTextAlignment="center" />
                            <span :text="'   ' + item.icon2" fontSize="20" color="red" :fontFamily="mdiFontFamily" />
                            <span :text="' ' + item.texticon2" verticalTextAlignment="center" />
                            <span :text="'   ' + item.icon3" fontSize="20" color="yellow" :fontFamily="mdiFontFamily" />
                            <span :text="' ' + item.texticon3" verticalTextAlignment="center" />
                        </label>

                        <label fontSize="12" verticalAlignment="middle" horizontalAlignment="center" textAlignment="right" paddingRight="20" color="brown" width="60" whiteSpace="true">
                            <span :text="item.icon1" fontSize="14" :fontFamily="mdiFontFamily" />
                            <span :text="'\n' + item.texticon1" paddingRight="10" />
                        </label>
                        <label :text="item.text4" color="lightgray" fontSize="14" textAlignment="right" paddingRight="20" paddingTop="4" />
                    </GridLayout> -->
                </v-template>
            </CollectionView>
        </StackLayout>
    </Page>
</template>

<script lang="ts">
import { mdiFontFamily } from '../variables';
import { stringify } from 'querystring';
const icons = [
    'mdi-numeric',
    'mdi-hat-fedora',
    'mdi-home-floor-g',
    'mdi-account-key',
    'mdi-ticket-confirmation',
    'mdi-rotate-orbit',
    'mdi-access-point',
    'mdi-arrow-right-bold-circle-outline',
    'mdi-crosshairs-gps',
    'mdi-jabber',
    'mdi-onepassword'
];

const randomLanguage = ['javascript', 'typescript', 'go', 'c++'];
export default {
    data() {
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
        // console.log('items', JSON.stringify(items));

        return {
            mdiFontFamily: mdiFontFamily,
            itemList: items
        };
    },
    methods: {
        onItemTap({ index, item }) {
            console.log(`Tapped on ${index} ${item.title}`);
        },
        logEvent(e) {
            console.log('logEvent', e.eventName, e.extraData);
        }
        // itemIdGenerator(item, i) {
        //   return item.index;
        // }
    }
};
</script>

<style scoped>
ActionBar {
    background-color: #53ba82;
    color: #ffffff;
}

.message {
    vertical-align: center;
    text-align: center;
    font-size: 20;
    color: #333333;
}
</style>
