import { actions, initial_state, final_state_must_include, AppleGoapNode as GoapNode } from './problem2';
import { buildGraph } from './goapComplex';
import * as Treeviz from 'treeviz';

// Powyższe tablice przekazuje się do funkcji znajdującej plan.

console.log("Początkowy stan świata:");
console.log(initial_state);
console.log("Akcje, które w tym świecie można wykonywać:");
console.log(actions);
console.log("Cele, które mają zostać osiągnięte:");
console.log(final_state_must_include);


interface GraphHistory {
    step: number;
    history: any[],
    renderer: any,
    sourceMapper: Function,
    stepForward: Function,
    stepBack: Function,
    playAll: Function,
    reset: Function
};

const graphHistory: GraphHistory = {
    step: 0,
    history: [],
    renderer: {},
    sourceMapper: function(graphObj: any) {
        this.renderer = graphObj;
        let fired = false;
        return (graphArr: GoapNode[], solution: any[]) => {
            const solutionKeys = solution.map((el) => el.id);
            const newArr = graphArr.map((el) => solutionKeys.includes(el.id) ? {...el, color: "green"} : el);
            this.history.push(newArr);

            if(!fired) {
                this.renderer.refresh(this.history[0]);
                fired = true;
            }
        }
    },
    stepForward: function() {
        this.step = this.step < this.history.length ? this.step+ 1 : this.history.length;
        this.renderer.refresh(this.history[this.step]);
    },
    stepBack: function() {
        this.step = this.step > 0 ? this.step - 1 : 0;
        this.renderer.refresh(this.history[this.step]);
    },
    playAll: function() {
        this.history.forEach((step: GoapNode) => this.renderer.refresh(step));
        this.step = this.history.length;
    },
    reset: function() {
        this.step = 0;
        this.renderer.refresh(this.history[this.step]);
    }
}

  
window.addEventListener('load', (event) => {
    // Define and configure a tree object
    const myTree = Treeviz.create({
        htmlId: "tree",
        idKey: "id",
        hasFlatData: true,
        isHorizontal: false,
        mainAxisNodeSpacing: 3,
        secondaryAxisNodeSpacing: 1.4,
        linkShape: "orthogonal",
        renderNode: (node) => `<div style="display:block; color: ${node.data.color || 'red'}">
            <h4>${node.data.key}</h4>
            <br>
            <p>
                <span>Action effects:</span> 
                <span>${JSON.stringify(node.data.action?.effects)}</span>
            </p>
            <br>
            <p>
                <span>Prereqs:</span> 
                <span>${JSON.stringify(node.data.prereqs)}</span>
            </p>
        </div>`,
        nodeHeight: 300,
        relationnalField: "parent",
    });
    const goalNode = new GoapNode(null, final_state_must_include);
    const graph = buildGraph(initial_state, actions, goalNode, graphHistory.sourceMapper(myTree));

    document.getElementById("back").addEventListener('click', () => graphHistory.stepBack());
    document.getElementById("forward").addEventListener('click', () => graphHistory.stepForward());
    document.getElementById("play-all").addEventListener('click', () => graphHistory.playAll());
    document.getElementById("reset").addEventListener('click', () => graphHistory.reset());


});
