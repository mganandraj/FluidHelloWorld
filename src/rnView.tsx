import React from 'react';
import { Text, AppRegistry, StyleSheet } from 'react-native';

// @ts-ignore
import {polyfillGlobal} from 'react-native/Libraries/Utilities/PolyfillFunctions';

import 'react-native-url-polyfill/auto';

import { DiceRollerContainerRuntimeFactory } from "./containerCode";
import { IDiceRoller } from "./dataObject";

import { getDefaultObjectFromContainer } from "@fluidframework/aqueduct";
import { getTinyliciousContainer } from "@fluidframework/get-tinylicious-container";

import appConfig from './appConfig'

// @ts-ignore
// if(global.performance.now)
    polyfillGlobal('performance', () => require('./performance').PERF);

polyfillGlobal('TextEncoder', () => require('./TextEncoder').TextEncoder);
polyfillGlobal('TextDecoder', () => require('./TextDecoder').TextDecoder);

// polyfillGlobal('crypto', () => require('./cryptoStubs').CRYPTO);
// polyfillGlobal('sha1', () => require('./cryptoStubs').SHA1);

interface RnViewProps {
    myText: String;
}

interface RnViewStates {
    myText: String;
}

class FluidHelloWorld extends React.Component<RnViewProps, RnViewStates> {
    
    constructor(props: RnViewProps) {
        super(props);
        this.state = {
           myText: '🎲'
        }
    }

    async componentDidMount() {

        let documentId;
        let createNew;
        if( appConfig && appConfig.documentId) {
            documentId = appConfig.documentId;
            createNew = appConfig.createNew;
        } else {
            documentId = "abcd1234";
            createNew = false;
        }
        
        const container = await getTinyliciousContainer(documentId, DiceRollerContainerRuntimeFactory, createNew);

        // In this app, we know our container code provides a default data object that is an IDiceRoller.
        const diceRoller: IDiceRoller = await getDefaultObjectFromContainer<IDiceRoller>(container);

        this.setState({myText: String.fromCodePoint(0x267F + diceRoller.value)});
        diceRoller.on("diceRolled", () => {console.log("dice rolled"); this.setState({myText: String.fromCodePoint(0x267F + diceRoller.value)})});
    }
    
    render() {
        return (
            <Text style={styles.diceRollerText} >{this.state.myText}</Text>
        );
    }
}

const styles = StyleSheet.create({
    diceRollerText: {
      fontWeight: "bold",
      fontSize: 48
    }
  });

// console.warn(performance.now());
// console.warn(performance.now());

AppRegistry.registerComponent("FluidHelloWorld", () => FluidHelloWorld);