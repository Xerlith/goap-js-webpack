import { GoapAction, IState, GoapNode } from "./types";

const CAN_ACTIONS_REPEAT = false;
  
export function buildGraph (state: IState, actions: GoapAction<any, any>[], goalNode: GoapNode, displayCallback: Function = () => {}) {
    const start = goalNode;
    start.cost = 0;
    start.heuristicCost = 0;

    let currentNode = start;

    const nodes = [start];

    while(nodes.filter(node => node.visited != true).length > 0) {

        currentNode = getUnvisitedNodeWithLowestScore(nodes);
   
        if (currentNode.isSubsetOf(state)) {
            displayCallback(nodes, buildPath(currentNode, nodes));
            return buildPath(currentNode, nodes);
        }
        currentNode.visited = true;    
        
        let availableActions = CAN_ACTIONS_REPEAT ? actions : actions.filter((a) => a.name != currentNode.key);

        for (let action of availableActions) {
            if (currentNode.doEffectsMatch(action)) {
                let newState = currentNode.createInstance(action);
                newState.satisfiedPrereqs = currentNode.getSatisfiedConditions(action);
                newState.prereqs = currentNode.getRemainingGoal(action);
                newState.heuristicCost = newState.calculateHeuristicCost(state);
                newState.cost = currentNode.cost + newState.heuristicCost + action.cost;
                
                let identicalNodes = nodes.filter(node => node.equals(newState));

                if(identicalNodes.length > 0 && identicalNodes.find(node => node.cost > newState.cost)) {
                    actions = actions.filter(a => a.name != newState.key);
                } else {
                    newState.parent = currentNode.id;
                    newState.debugParent = currentNode;
                    nodes.push(newState);
                    displayCallback(nodes, buildPath(currentNode, nodes));
                }
            }
        }
    }

    return 'no plan';
}

const buildPath = (node: GoapNode, nodes: any[]): GoapNode[] => {
    const path = [];
    let currentNode = node;
    while (currentNode) {
        path.push(currentNode);
        currentNode = nodes.find(el => el.id == currentNode.parent);
    }
    return path;
}

const getUnvisitedNodeWithLowestScore = (nodes: GoapNode[]): GoapNode => {
    return nodes.filter(node => !node.visited).sort((a, b) => a.cost < b.cost ? -1 : 1)[0];
}

const runPlannerConsole = (state: IState, actions: GoapAction<any,any>[], goal: GoapNode) => {
    const plan = buildGraph(state, actions, goal);
    console.log(plan);
}

