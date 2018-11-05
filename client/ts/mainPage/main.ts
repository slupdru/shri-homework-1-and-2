import {createStore} from "@/mySuperFlux9000";
import "@/styles/allPages.scss";
import "@/styles/main.scss";
import "pepjs";
import { $, $$ } from "../helpers/dom";
import postQuery from "../helpers/postQuery";
import getDataAndMakeCards from "./getDataAndMakeCards";
// import data from './events';

interface IState {
  page: number;
  type: typeDictionary;
  quantity: number;
}
type typeDictionary = "info" | "critical" | "all";

enum typeActionsDictionary {
  CHANGE_PAGE = "CHANGE_PAGE",
  CHANGE_TYPE = "CHANGE_TYPE",
  CHANGE_QUANTITY = "CHANGE_QUANTITY",
}
interface IAction<T> {
  type: typeActionsDictionary;
  value: T;
}

function actionFunc<T>(state: T, action: IAction<T>, actionTypeExpected: typeActionsDictionary): T {
  if (action.type === actionTypeExpected) {
      return action.value;
  } else { return state; }
}

const reducer = (State: IState, action: any): IState => {
  const newStore: IState = Object.assign({},
    State,
    {
      page: actionFunc<number>(State.page, action, typeActionsDictionary.CHANGE_PAGE),
      quantity: actionFunc<number>(State.quantity, action, typeActionsDictionary.CHANGE_QUANTITY),
      type: actionFunc<typeDictionary>(State.type, action, typeActionsDictionary.CHANGE_TYPE),
    },
    );
  return newStore;
};

let initState: IState = {
  page: 1,
  quantity: 10,
  type: "all",
};
function initStore() {
  const store = createStore<IState>(reducer, initState);
  store.subscribe(() => {
    const state = store.getState();
    getDataAndMakeCards(state);
    saveState(state);
  });
  const typeSelect = $<HTMLSelectElement>("#type");
  const pageInput = $<HTMLInputElement>("#page");
  const quantityInput = $<HTMLInputElement>("#quantity");
  typeSelect.value = initState.type;
  pageInput.value = String(initState.page);
  quantityInput.value = String(initState.quantity);
  typeSelect.addEventListener("change", () => {
    store.dispatch({ type: typeActionsDictionary.CHANGE_TYPE,  value: typeSelect.value});
  });
  pageInput.addEventListener("change", () => {
    store.dispatch({ type: typeActionsDictionary.CHANGE_PAGE,  value: Number(pageInput.value)});
  });
  quantityInput.addEventListener("change", () => {
    store.dispatch({ type: typeActionsDictionary.CHANGE_QUANTITY,  value: Number(quantityInput.value)});
  });
}

async function loadState() {
  const state: IState | null = await postQuery<IState>("http://localhost:8000/api/getstate", {});
  if (!state) { return initState; } else {
    return state;
  }
}
async function saveState(state) {
  const result = await postQuery<boolean>("http://localhost:8000/api/savestate", state);
  if (result) {
    return result;
  } else {
    throw new Error("result save state false");
  }
}
loadState()
.then(async (state) => {
  initState = state;
  await getDataAndMakeCards(initState);
  initStore();
});
