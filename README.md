# Домашнее задание по архитектуре.
 
``` bash
#  Запуск сервера
cd server  
npm start  

# Запустить сборку webpack
cd client  
npm run build  

#  Запустить линтеры
npm run lint  

```
## Для работы видео, необходимо поднять сбоку localhost с видео потоками

## Описание библиотеки для работы с состоянием
Библиотека состоит из одной функции:
```typescript
createStore <State>(reducer: (cur: State, action: object) => State, initialState: State): IStore<State>
```  
Она принимает reducer, а также базовое значение состояния и возвращает Store  
Интерфейс стора:
```typescript
interface IStore<currentState> {
    dispatch: (action: object) => object;
    subscribe: (newListener: Function) => void;
    getState: () => currentState;
}
```  
## Использование библиотеки
Используется для хранения состояния текущей страницы, типа отображаемых данных и количества элементов. Состояние сохраняется на сервере и подгружается при обновлении страницы. 
