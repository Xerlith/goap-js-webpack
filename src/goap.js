'use strict';

const guid = () => {
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

class Node {
    constructor(action, prereqs = action.prereqs) {
      this.key = action ? action.name : null;
      this.action = action;
      this.prereqs = prereqs;
      this.id = guid();
    }
    satisfiedPrereqs = [];
    visited = false;
    cost = Infinity; // the g value
    heuristicCost = Infinity;
    parent = null;
}
  
export const buildGraph = (state, actions, goal, exclusions, displayCallback = () => {}) => {
    const start = new Node(null, goal);
    start.cost = 0;
    start.heuristicCost = 0;

    let currentNode = start;

    const nodes = [start];


    while(nodes.filter(node => node.visited != true).length > 0) {

        // console.log('nodes', nodes);
        currentNode = getUnvisitedNodeWithLowestScore(nodes);
        // console.log('current', currentNode);
   
        if (currentNode.prereqs.isSubsetOf(state)) {
            displayCallback(nodes, buildPath(currentNode, nodes));
            return buildPath(currentNode, nodes);
        }
        currentNode.visited = true;    
        
        let availableActions = actions.filter((a) => a.name != currentNode.key);

        for (let action of availableActions) {
            if (checkActionEffects(action, currentNode.prereqs, exclusions)) {
                let newState = new Node(action);
                newState.satisfiedPrereqs = getSatisfiedConditions(action, currentNode.prereqs);
                newState.prereqs = buildIntermediateGoal(action, currentNode.prereqs)
                newState.heuristicCost = newState.prereqs.countMissingEntries(state);
                newState.cost = currentNode.cost + newState.heuristicCost + action.cost;
                
                let identicalNodes = nodes.filter(node => 
                    node.prereqs.equals(newState.prereqs) 
                    && node.satisfiedPrereqs.equals(newState.satisfiedPrereqs)
                );

                if(identicalNodes.length > 0 && identicalNodes.find(node => node.cost > newState.cost)) {
                    actions = actions.filter(a => a.name != newState.key);
                } else {
                    newState.parent = currentNode.id;
                    nodes.push(newState);
                    displayCallback(nodes, buildPath(currentNode, nodes));
                }
            }
        }
    }

    return 'no plan';
}

const buildPath = (node, nodes) => {
    const path = [];
    let currentNode = node;
    while (currentNode) {
        path.push(currentNode);
        currentNode = nodes.find(el => el.id == currentNode.parent);
    }
    return path;
}

const getUnvisitedNodeWithLowestScore = (nodes) => {
    return nodes.filter(node => !node.visited).sort((a, b) => a.cost < b.cost ? -1 : 1)[0];
}

const runPlannerConsole = (state, actions, goal) => {
    const plan = buildGraph(state, actions, goal);
    console.log(plan);
}

/* 
 *
 * HELPER FUNCTIONS
 * 
 */

const checkActionEffects = (action, goal, exclusions) => {
    if (!action) {
        return false;
    }
    
    const intermediateGoal = buildIntermediateGoal(action, goal);

    if(exclusions.some(exclusion => intermediateGoal.filter(el => el.includes(exclusion)).length > 1)) {
        return false;
    }

    for (let effect of Object.keys(action.effects)) {
        if (action.effects[effect] && goal.includes(effect))
            return true;
    }
    return false;
}

const applyEffectsToState = (action, state) => {
    const newState = [...state];

    for(effect of Object.keys(action.effects)) {
        if (action.effects[effect]) {
            newState.push(effect);
        }
    }

    return newState;
}

const getSatisfiedConditions = (action, goal) => {
    let satisfiedConditions = [];
    if(action && action.effects) {
        for(let cond of goal) {
            if (action.effects[cond]) {
                satisfiedConditions.push(cond);
            }
        }
    }
    return satisfiedConditions;
}

const buildIntermediateGoal = (action, goal) => {
    let newGoal = [...goal];
    if(action && action.effects) {
        for(let cond of goal) {
            if (action.effects[cond]) {
                newGoal = newGoal.filter(item => item != cond);
            }
        }
        // if(action.prereqs.some(el => el.includes("At("))) {
        //     newGoal = newGoal.filter(el => !el.includes("At("));
        // }
        newGoal = [...newGoal, ...action.prereqs].unique();
    }
    return newGoal;
}

Array.prototype.countMissingEntries = function(arr) {
    let parent = this;
    let count = 0;
    for (let item of arr) {
        if (parent.indexOf(item) == -1)
            count++;
    }
    return count;
}

Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

Array.prototype.equals = function (b) {
    var a = this;
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
  }

Array.prototype.isSubsetOf = function(ArrA) {
    var ArrB = this;
    return ArrB.every(val => ArrA.includes(val));
};

