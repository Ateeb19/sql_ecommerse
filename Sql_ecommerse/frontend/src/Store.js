import {configureStore} from '@reduxjs/toolkit';
import { customReducer } from './Reducers';

const Store = configureStore({
    reducer: {
        customReducer,
    },
});

export default Store;