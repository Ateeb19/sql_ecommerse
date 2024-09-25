import { createAction, createReducer } from '@reduxjs/toolkit';

const instantState = {
    token: '0',
    role: 'user',
}

const setToken = createAction('setToken');
const userRole = createAction('userRole');
const addCart = createAction('addCart');

export const customReducer = createReducer(instantState, (builder) => {
    builder.addCase(
        setToken, (state, action) => {
            state.token = action.payload;
            localStorage.setItem('token', state.token);
        }
    )
    builder.addCase(
        userRole, (state, action) => {
            state.role = action.payload;
            localStorage.setItem('role',state.role);
        }
    )
    // builder.addCase(
    //     addCart, (state, action)=> {
    //         state.cart = action.payload
    //         localStorage.setItem('cart',state.cart.id);
    //     }
    // )
});