interface IStore<currentState> {
    dispatch: (action: object) => object;
    subscribe: (newListener: Function) => void;
    getState: () => currentState;
}
function createStore
<State>(reducer: (cur: State, action: object) => State, initialState: State):
 IStore<State> {
  const currentReducer = reducer;
  let  currentState: State = initialState;
  const listenersArray: Function[] = [];
  return {
      getState() {
          return currentState;
      },
      dispatch(action) {
          currentState = currentReducer(currentState, action);
          for (const listener of listenersArray) {
            listener(action);
          }

          return action;
      },
      subscribe(newListener) {
        listenersArray.push(newListener);
      },
  };
}
export default createStore;
