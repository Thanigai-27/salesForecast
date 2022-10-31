from flask_cors import CORS, cross_origin
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from os.path import join, dirname, realpath
import sklearn.metrics as sm

def create_model(filename):
    UPLOAD_FOLDER = join(dirname(realpath(__file__)), 'static/uploads/'+ filename)
    input = pd.read_csv(UPLOAD_FOLDER)
    input.isnull().sum()
    x = input[['YEAR']]
    y = input[['SalesInMillions']]
    x_train, x_test, y_train, y_test = train_test_split(
            x, y, test_size=0.33, random_state=0)
    model = LinearRegression()
    model.fit(x_train, y_train)
    return model

def sales_prediction(start_year, end_year,filename):
    UPLOAD_FOLDER = join(dirname(realpath(__file__)),'static/uploads/'+ filename)
    input = pd.read_csv(UPLOAD_FOLDER)
    input.isnull().sum()
    model = create_model(filename)
    sales_predict = {}
    for year in range(start_year, end_year+1):
        predicted_sales = np.double(model.predict([[year]]))
        mask = input[['YEAR']].values == year
        rows = input.loc[mask]
        actual_sales = 0
        if len(rows.index) > 0:
            actual_sales = rows['SalesInMillions'].mean()
        sales_data = {"actual_sales" : actual_sales, "predicted_sales" : predicted_sales }
        sales_predict[year] = sales_data
    return sales_predict

def get_accuracy(filename):
    UPLOAD_FOLDER = join(dirname(realpath(__file__)), 'static/uploads/'+ filename)
    input = pd.read_csv(UPLOAD_FOLDER)
    input.isnull().sum()
    model = create_model(filename)
    x = input[['YEAR']]
    y = input[['SalesInMillions']]
    y_pred = model.predict(x)
    mae = round(sm.mean_absolute_error(y, y_pred), 2)
    mse = round(sm.mean_squared_error(y, y_pred), 2)
    meae = round(sm.median_absolute_error(y, y_pred), 2)
    evs = round(sm.explained_variance_score(y, y_pred), 2)
    r2 = round(sm.r2_score(y, y_pred), 2)
    accuracy ={
        'mean_absolute_error' : mae,
        'mean_squared_error' : mse,
        'median_absolute_error': meae,
        'explained_variance_score' : evs,
        'R2_score' : r2
    }
    return accuracy

def sales_prediction_for_year(year, filename):
    model = create_model(filename)
    predicted_sales = np.double(model.predict([[year]]))
    sales = {"predicted_sales" : predicted_sales }
    return sales


    