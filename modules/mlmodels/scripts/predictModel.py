import pandas as pd
import numpy as np
from sklearn import preprocessing, cross_validation, svm
from sklearn.linear_model import LinearRegression
from sklearn.feature_extraction.text import TfidfVectorizer
import sys, os, pickle

from urllib.parse import urlencode
from urllib.request import Request, urlopen

from sklearn.externals import joblib

try:
  filePath = sys.argv[1]
  modelDataFolder = sys.argv[2] + '\\'
  modelID = sys.argv[3]
  strFeat = []
  stringFeatures = []
  if(len(sys.argv) > 4 and len(sys.argv[4]) > 0):
    strFeat = sys.argv[4].split(',')
    stringFeatures = [int(x)-1 for x in strFeat]

  if not os.path.exists(modelDataFolder):
    os.makedirs(modelDataFolder)

  df = pd.read_csv(filePath, header=None, quotechar='"', skipinitialspace=True, encoding='utf-8')

  # ############################### PICKLE FILES ############################### #

  def loadPickleFile(pkl_name):
    if os.path.exists(modelDataFolder + pkl_name + '.pkl'):
      pickle_in = open(modelDataFolder + pkl_name + '.pkl', 'rb')
      pkl_obj = pickle.load(pickle_in)
      return pkl_obj
    else:
      return False

  def loadMLModel():
    if os.path.exists(modelDataFolder + 'model.pkl'):
      mlmodel = joblib.load(modelDataFolder + 'model.pkl')
      return mlmodel
    else:
      return False
      
  # ############################### X REGION ############################### #

  X = df
  X_type = [X[i].dtype for i in X]
  X = X.values

  indices_to_drop = []
  for i in range(len(X_type)):
    if(i in stringFeatures):
      vectorizer = loadPickleFile('xVectorizer' + str(i))
      X_new = (vectorizer.transform(X[:,i])).todense()
      X = np.column_stack((X, X_new))
      indices_to_drop.append(i)
      continue;
    if(not (X_type[i] == np.float64 or X_type[i] == np.int64)):
      labelEncoder = loadPickleFile('xLabelEncoder' + str(i))
      X[:,i] = labelEncoder.transform(X[:,i])

  for i in indices_to_drop:
    X = np.delete(X, i, 1)

  # ############################### MODEL TRAINING ############################### #
  model = loadMLModel()
  y = model.predict(X)
  yLabelEncoder = loadPickleFile('yLabelEncoder')
  if(yLabelEncoder):
    y = yLabelEncoder.inverse_transform(y)
  # joined_y = ('\n'.join(y))
  with open(modelDataFolder + modelID + '.txt', "w") as text_file:
      text_file.write('\n'.join(y))
  # np.savetxt(modelDataFolder + modelID + '.csv', y, delimiter=",")
except Exception as exp:
  post_fields = {'trainingStatus': 'Idle', 'lastTrainingStatus': 'Failed'}
  print('failed')
else:
  post_fields = {'trainingStatus': 'Idle', 'lastTrainingStatus': 'Predictions successful!', 'predictionDownloadLink': modelDataFolder + modelID + '.txt'}
  print('success') 
try:
  # ############################### UPDATING STATUS ############################### #
  url = 'http://localhost:80/api/models/' + modelID + '/status' # Set destination URL here
  request = Request(url, urlencode(post_fields).encode())
  resp = urlopen(request).read().decode()
  print(resp)
except:
  print('error')
else:
  print('no error')
  # print(resp)