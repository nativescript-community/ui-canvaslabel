<script>
    import { Template } from 'svelte-native/components';
    import { mdiFontFamily } from './variables';

    console.log('mdiFontFamily', mdiFontFamily);
    function onItemTap({ index, item }) {
        console.log(`Tapped on ${index} ${item.title}`);
    }
    function logEvent(e) {
        console.log('logEvent', e.eventName, e.extraData);
    }
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
        'mdi-onepassword',
    ];
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
        text4: i % 3 === 0 ? 'test' : '',
    }));
</script>

<page>
    <actionBar title="Svelte CanvasLabel App" />
    <gridLayout>
        <collectionView width="100%" height="100%" rowHeight="80" ref="listView" {items} on:itemTap={onItemTap} itemIdGenerator="index">
            <Template let:item>
                <canvaslabel id="canvaslabel" fontSize="10" color="white" backgroundColor="darkgray" margin="4">
                    <cgroup id="group1" fontSize="18" verticalAlignment="middle" paddingLeft="20" fontStyle="italic">
                        <cspan id="text1" text={item.text1} fontWeight="bold" />
                        <cspan id="text2" text={'\n' + item.text2} color="#ccc" fontSize="16" fontStyle="normal" />
                        <cspan id="text3" text={item.text2} color="#eee" fontFamily="Lato-Regular" fontSize="16" fontStyle="normal" />
                    </cgroup>
                    <line id="line" :antiAlias="true" color="yellow" startX="10%" startY="34%" stopX="90%" stopY="90%" strokeCap="round" strokeJoin="round" strokeWidth="4" dash="1 10 0" />
                    <cgroup id="group2" fontSize="12" verticalAlignment="bottom" paddingLeft="20" paddingBottom="1">
                        <cspan id="icon1" text={item.icon1} fontSize="20" color="green" fontFamily={mdiFontFamily}/>
                        <cspan id="texticon1" text={' ' + item.texticon1} verticalTextAlignment="center" />
                        <cspan id="icon2" text={' ' + item.icon2} fontSize="20" color="red" fontFamily={mdiFontFamily}/>
                        <cspan id="texticon2" text={' ' + item.texticon2} verticalTextAlignment="center" />
                        <cspan id="icon3" text={' ' + item.icon3} fontSize="20" color="yellow" fontFamily={mdiFontFamily}/>
                        <cspan id="icon3" text={' ' + item.icon3} verticalTextAlignment="center" />
                    </cgroup>

                    <cgroup id="group3" fontSize="12" verticalAlignment="middle" horizontalAlignment="center" textAlignment="right" paddingRight="20" color="brown" width="60">
                        <cspan id="icon12" text={item.icon1} fontSize="14" fontFamily={mdiFontFamily}/>
                        <cspan id="texticon12" text={'\n' + item.texticon1} paddingRight="10" />
                    </cgroup>
                    <cspan id="text4" fontFamily="arial" text={item.text4} color="lightgray" fontSize="14" textAlignment="right" paddingRight="20" paddingTop="4" />

                </canvaslabel>
                <!-- <GridLayout backgroundColor="darkgray">
                        <label fontSize="18" verticalAlignment="middle" paddingLeft="20"  whiteSpace="true">
                            <span text={item.text1} fontWeight="bold" />
                            <span text={'\n' + item.text2} color="#ccc" fontSize="16" />
                        </label>

                        <label fontSize="12" verticalAlignment="bottom" paddingLeft="20" paddingBottom="1">
                            <span text={item.icon1} fontSize="20" color="green" fontFamily={mdiFontFamily}/>
                            <span text={' ' + item.texticon1} verticalTextAlignment="center" />
                            <span text={'   ' + item.icon2} fontSize="20" color="red" fontFamily={mdiFontFamily}/>
                            <span text={' ' + item.texticon2} verticalTextAlignment="center" />
                            <span text={'   ' + item.icon3} fontSize="20" color="yellow" fontFamily={mdiFontFamily}/>
                            <span text={' ' + item.texticon3} verticalTextAlignment="center" />
                        </label>

                        <label fontSize="12" verticalAlignment="middle" horizontalAlignment="center" textAlignment="right" paddingRight="20" color="brown" width="60" whiteSpace="true">
                            <span text={item.icon1} fontSize="14" fontFamily={mdiFontFamily}/>
                            <span text={'\n' + item.texticon1} paddingRight="10" />
                        </label>
                        <label text={item.text4} color="lightgray" fontSize="14" textAlignment="right" paddingRight="20" paddingTop="4" />
                    </GridLayout> -->
            </Template>
        </collectionView>
    </gridLayout>
</page>
