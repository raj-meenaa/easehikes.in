import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</React.StrictMode>
);


// import ReactDOM from 'react-dom/client';
// import App from './App';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// const queryClient = new QueryClient();

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <QueryClientProvider client={queryClient}>
//     <App />
//   </QueryClientProvider>
// );

