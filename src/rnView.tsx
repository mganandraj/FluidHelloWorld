import './shims'
import React from 'react';
import { Alert, Text, TouchableOpacity, View, AppRegistry, StyleSheet } from 'react-native';

import { DiceRollerContainerRuntimeFactory } from "./containerCode";
import { IDiceRoller } from "./dataObject";

import { getDefaultObjectFromContainer } from "@fluidframework/aqueduct";
import { getTinyliciousContainer } from "@fluidframework/get-tinylicious-container";

import appConfig from './appConfig'

interface RnViewProps {
    myText: String;
}

interface RnViewStates {
    diceValue: string;
    documentId: string;
    createNew: boolean;
    diceRoller: IDiceRoller | undefined;
}

class FluidHelloWorld extends React.Component<RnViewProps, RnViewStates> {
    
    constructor(props: RnViewProps) {
        super(props);
        
        let documentId;
        let createNew;
        if( appConfig && appConfig.documentId) {
            documentId = appConfig.documentId;
            createNew = appConfig.createNew;
        } else {
            documentId = "abcd1234";
            createNew = false;
        }

        this.state = {
            diceValue: '🎲',
            documentId: documentId,
            createNew: createNew,
            diceRoller: undefined
        }
    }

    async componentDidMount() {

        const container = await getTinyliciousContainer(this.state.documentId, DiceRollerContainerRuntimeFactory, this.state.createNew);

        // In this app, we know our container code provides a default data object that is an IDiceRoller.
        const diceRoller: IDiceRoller = await getDefaultObjectFromContainer<IDiceRoller>(container);

        this.setState({diceValue: String.fromCodePoint(0x267F + diceRoller.value), diceRoller: diceRoller});
        diceRoller.on("diceRolled", () => {
            this.setState({diceValue: String.fromCodePoint(0x267F + diceRoller.value)})
        });
    }

    render() {
        return (
            <View style={styles.screenContainer}>
                <TouchableOpacity style={styles.buttonOuterLayout} onPress={ () => 
                    { 
                        if(this.state.diceRoller)
                            this.state.diceRoller.roll(); 
                        else 
                            Alert.alert('diceRoller is not initialized !');

                    }
                }>
                    <Text style={styles.diceRollerText} >{this.state.diceValue} </Text>
                </TouchableOpacity>
                
                <Text>{this.state.documentId}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        padding: 16
      },
    diceRollerText: {
      fontWeight: "bold",
      fontSize: 64
    },
    buttonOuterLayout: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginBottom: 10
      },
  });

AppRegistry.registerComponent("FluidHelloWorld", () => FluidHelloWorld);