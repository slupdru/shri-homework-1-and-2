// function combineReducers<IStore, reducerObject>(funcObj: reducerObject): (Store: IStore, action: string) => IStore {
//   function reducer (Store: IStore, action: string): IStore{
//     const newStore = Object.assign({}, Store);
//     for (let func in funcObj){
//       const key = func as unknown as keyof IStore;
//       if (newStore[key]){
//         if (typeof funcObj[func] === 'function'){
//           newStore[key] = funcObj[func](Store, action);
//         }

//       }
//     }
//     return newStore;
// } 
//   return reducer;
// }
// export default combineReducers;
// export default function combineReducers(reducers) {
//   const reducerKeys = Object.keys(reducers)
//   const finalReducers = {}
//   for (let i = 0; i < reducerKeys.length; i++) {
//     const key = reducerKeys[i]

//     if (typeof reducers[key] === 'function') {
//       finalReducers[key] = reducers[key]
//     }
//   }
//   const finalReducerKeys = Object.keys(finalReducers)

//   let unexpectedKeyCache
//   if (process.env.NODE_ENV !== 'production') {
//     unexpectedKeyCache = {}
//   }

//   let shapeAssertionError
//   try {
//     assertReducerShape(finalReducers)
//   } catch (e) {
//     shapeAssertionError = e
//   }

//   return function combination(state = {}, action) {
//     if (shapeAssertionError) {
//       throw shapeAssertionError
//     }

//     let hasChanged = false
//     const nextState = {}
//     for (let i = 0; i < finalReducerKeys.length; i++) {
//       const key = finalReducerKeys[i]
//       const reducer = finalReducers[key]
//       const previousStateForKey = state[key]
//       const nextStateForKey = reducer(previousStateForKey, action)
//       if (typeof nextStateForKey === 'undefined') {
//         const errorMessage = getUndefinedStateErrorMessage(key, action)
//         throw new Error(errorMessage)
//       }
//       nextState[key] = nextStateForKey
//       hasChanged = hasChanged || nextStateForKey !== previousStateForKey
//     }
//     return hasChanged ? nextState : state
//   }
// }