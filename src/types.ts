export interface IState {
    [key: string]: number | string | IState;
};

export interface GoapAction<PrereqsType, EffectsType> {
    name: string;
    prereqs: PrereqsType,
    effects: EffectsType,
    cost: number;
}

export abstract class GoapNode {
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
        this.key = action ? action.name : null;
        this.action = action;
        this.prereqs = prereqs;
        this.id = this.guid();
    }

    guid() {
        let s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    abstract createInstance(action: GoapAction<IState,IState>, prereqs?: IState): GoapNode;
    abstract isSubsetOf(state: IState): boolean;
    abstract equals (otherNode: GoapNode): boolean;
    abstract calculateHeuristicCost(state: IState): number;
    abstract doEffectsMatch(action: GoapAction<IState, IState>): boolean;
    abstract getSatisfiedConditions(action: GoapAction<IState,IState>): IState;
    abstract getRemainingGoal(action: GoapAction<IState,IState>): IState;
}
