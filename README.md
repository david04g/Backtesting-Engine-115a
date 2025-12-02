# Backtesting Engine
If working, the app can be easily accessed through clicking [here](https://backtesting-engine-115a.vercel.app/) or the link https://backtesting-engine-115a.vercel.app/
However, if the Vercel app is not working, please follow the below installation guide:
1. First, Download the repository and unzip the zip file. 
2. Then, navigate to the `Backtesting-Engine-115a` repository in your terminal and run `pip install -r requirements.txt`
3. Next, run the command `uvicorn main:app`. This will run the backend of the application.
4. Open a new terminal and navigate to `Backtesting-Engine-115a/frontend`
5. Run `npm install --save-dev`
6. Then, run `npm run build`
7. Finally, run `npx serve -s build`
8. Ctrl+Click the http://localhost:3000 or type in http://localhost:3000 in your browser.
This should allow the application to run locally. 

