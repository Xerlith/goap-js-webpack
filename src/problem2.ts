import { GoapNode, IState } from "./types";
import { GoapAction } from "./types";

export class AppleGoapNode extends GoapNode {
    key: string;
    id: string;
    prereqs: IState;
    action: GoapAction<IState,IState>;
    satisfiedPrereqs: IState;
    visited = false;
    cost = Infinity; // the g value
    heuristicCost = Infinity;
    parent: string = null;
    debugParent?: GoapNode;
    
    constructor(action: GoapAction<IState,IState>, prereqs = action.prereqs) {
        super(action, prereqs);
    }

    createInstance(action: GoapAction<IState, IState>, prereqs: IState): GoapNode {
        return new AppleGoapNode(action, prereqs);
    }

    guid() {
        let s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    isSubsetOf(state: IState) {
        var ObjB = this.prereqs;
        const result = Object.keys(ObjB).every(val => Object.keys(state).includes(val) && 
        (
            (typeof ObjB[val] == 'number' && state[val] >= ObjB[val]) ||
            (typeof ObjB[val] == 'string' && state[val] == ObjB[val])
        ));
        return result;
    }

    
    equals(otherNode: GoapNode) {
        const objEqual = function(object1: IState, object2: IState) {
            const keys1 = Object.keys(object1);
            const keys2 = Object.keys(object2);
            if (keys1.length !== keys2.length) {
                return false;
            }
            for (let key of keys1) {
                if (object1[key] !== object2[key]) {
                return false;
                }
            }
            return true;
        }

        return objEqual(this.prereqs, otherNode.prereqs) && objEqual(this.satisfiedPrereqs, otherNode.satisfiedPrereqs)
    }

    calculateHeuristicCost (state: IState): number {
            let count = 0;
            for (let item of Object.keys(this.prereqs)) {
                if (Object.keys(state).indexOf(item) == -1 ||
                    (typeof state[item] == 'string' && state[item] != this.prereqs[item]) ||
                    (typeof this.prereqs[item] == 'number' && typeof state[item] == 'number' && this.prereqs[item] <= state[item])
                ) {
                    count++;
                }
                
            }
            return count;
    }

    doEffectsMatch (action: GoapAction<IState,IState>) {
        if (!action) {
            return false;
        }
        
        // const intermediateGoal = buildIntermediateGoal(action, goal);
        // if(exclusions.some(exclusion => intermediateGoal.filter(el => el.includes(exclusion)).length > 1)) {
        //     return false;
        // }
        let interWorld = {
            ...action.effects, ...action.prereqs
        };


        for (let effect of [...Object.keys(action.prereqs), ...Object.keys(action.effects)]) {

            if(action.prereqs[effect] 
                && this.prereqs[effect] 
                && (typeof action.prereqs[effect] == 'string') 
                && action.prereqs[effect] != this.prereqs[effect] 
                && action.effects[effect] != this.prereqs[effect]
            ) {
                // The action's prerequisites contradict the intermediate state
                return false;
            }

            if (
                this.prereqs[effect] != undefined &&
                (Number.isInteger(action.effects[effect]) && (action.effects[effect] > 0 && this.prereqs[effect] > 0) ||
                action.effects[effect] == this.prereqs[effect])
            )
                // The action can advance the initial state toward the intermediate state
                return true;
        }
        // the action can't advance the initial state
        return false;
    }

    getSatisfiedConditions(action: GoapAction<IState,IState>): IState {
        let satisfiedConditions: IState = {};
        if(action && action.effects) {
            for(let cond of Object.keys(this.prereqs)) {
                if (action.effects[cond] && Number.isInteger(action.effects[cond])) {
                    satisfiedConditions[cond] = this.prereqs[cond] as number - (action.effects[cond] as number);
                }
            }
        }
        return satisfiedConditions;
    }

    getRemainingGoal(action: GoapAction<IState,IState>) {
        let newGoal = {...this.prereqs};
        if(action && action.prereqs) {
            for(let cond of Object.keys(this.prereqs)) {
                if(action.effects[cond])
                    newGoal[cond] = newGoal[cond] as number - (action.effects[cond] as number);
            }
            // if(action.prereqs.some(el => el.includes("At("))) {
            //     newGoal = newGoal.filter(el => !el.includes("At("));
            // }
            newGoal = {...newGoal, ...action.prereqs};
        }
        return newGoal;
    }
}

export const initial_state: IState = {
    at: "home",
    money: 10,
    apples: 0,
    gardenApples: 10,
    storeApples: 100
};

export const final_state_must_include = {
    apples: 10
};

export const actions = [
    {
        name: "travel home -> garden",
        prereqs: {
            at: "home"
        },
        effects: {
            at: "garden",
        },
        cost: 1
    },
    {
        name: "travel home -> store",
        prereqs: {
            at: "home"
        },
        effects:  {
            at: "store"
        },
        cost: 2
    },
    {
        name: "travel garden -> home",
        prereqs: {
            at: "garden"
        },
        effects:  {
            at: "home"
        },
        cost: 1
    },
    {
        name: "travel garden -> store",
        prereqs: {
            at: "garden"
        },
        effects:  {
            at: "store"
        },
        cost: 3
    },
    {
        name: "travel store -> home",
        prereqs: {
            at: "store"
        },
        effects:  {
            at: "home"
        },
        cost: 2
    },
    {
        name: "travel store -> garden",
        prereqs: {
            at: "store"
        },
        effects:  {
            at: "garden"
        },
        cost: 3
    },
    {
        name: "buy apples",
        prereqs: { 
            at: "store",
            money: 5 
        },
        effects: {
            money: -5,
            apples: 5
        },
        cost: 0
    },
    {
        name: "pick apples",
        prereqs: { 
            at: "garden",
            gardenApples: 5 
        },
        effects: {
            gardenApples: -5,
            apples: 5
        },
        cost: 0
    },
]