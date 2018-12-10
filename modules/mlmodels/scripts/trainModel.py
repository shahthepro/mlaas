import pandas as pd
import numpy as np
from sklearn import preprocessing, cross_validation, svm
from sklearn.linear_model import LinearRegression
from sklearn.linear_model import Perceptron
from sklearn.feature_extraction.text import TfidfVectorizer
import sys, os, pickle, jsonpickle

from urllib.parse import urlencode
from urllib.request import Request, urlopen

from sklearn.externals import joblib

try:
  filePath = sys.argv[1]
  modelDataFolder = sys.argv[2] + '\\'
  modelType = int(sys.argv[3])
  modelID = sys.argv[4]
  strFeat = []
  stringFeatures = []
  featuresCount = 0

  if(len(sys.argv) > 5 and len(sys.argv[5]) > 0):
    strFeat = sys.argv[5].split(',')
    stringFeatures = [int(x)-1 for x in strFeat]

  if not os.path.exists(modelDataFolder):
    os.makedirs(modelDataFolder)

  df = pd.read_csv(filePath, header=None, quotechar='"', skipinitialspace=True, encoding='utf-8')

  featuresCount = len(df.columns)

  # ############################### LABELENCODER ############################### #

  def createOrLoadLabelEncoder(pkl_name, df_col):
    if os.path.exists(modelDataFolder + pkl_name + '.pkl'):
      # Load labelEncoder
      pickle_in = open(modelDataFolder + pkl_name + '.pkl', 'rb')
      labelEncoder = pickle.load(pickle_in)
      # Encode new labels
      encodedLabels = labelEncoder.classes_
      encodedLabels = [*encodedLabels, *df_col]
      labelEncoder.fit(encodedLabels)
    else:
      # Create labelEncoder
      labelEncoder = preprocessing.LabelEncoder()
      labelEncoder.fit(df_col.astype(str))
    # write labelEncoder and return
    writePickleFile(pkl_name, labelEncoder)
    return labelEncoder

  # ############################### VECTORIZER ############################### #
  def createOrLoadVectorizer(pkl_name, data_col):
    if os.path.exists(modelDataFolder + pkl_name + '.pkl'):
      # Load vectorizer
      pickle_in = open(modelDataFolder + pkl_name + '.pkl', 'rb')
      vectorizer = pickle.load(pickle_in)
      # TODO: Include new words in string too
    else:
      # Create vectorizer
      vectorizer = TfidfVectorizer(encoding='utf-8', analyzer='word', min_df=1)
      vectorizer.fit(data_col)
    # write vectorizer and return
    writePickleFile(pkl_name, vectorizer)
    return vectorizer

  # ############################### MLMODEL ############################### #
  def createOrLoadMLModel():
    if os.path.exists(modelDataFolder + 'model.pkl'):
      # Load model
      # pickle_in = open(modelDataFolder + 'model.pkl', 'rb')
      # mlmodel = pickle.load(pickle_in)
      mlmodel = joblib.load(modelDataFolder + 'model.pkl')
      return mlmodel;
      # with open(modelDataFolder + 'model.json', 'r') as f:
      #   pickled = f.read()
      # print(pickled)
      # mlmodel = jsonpickle.decode(pickled)
      # TODO: Include new words in string too
    else:
      # Create model
      if(modelType == 1):
        mlmodel = svm.SVC()
        writeModelFile(mlmodel)
        return mlmodel;
      elif(modelType == 2):
        mlmodel = Perceptron()
        writeModelFile(mlmodel)
        return mlmodel;
      else:
        mlmodel = LinearRegression()
        writeModelFile(mlmodel)
        return mlmodel;
      # pickled = jsonpickle.encode(mlmodel)
      # print(pickled)
      # with open(modelDataFolder + 'model.json', 'w') as f:
      #   f.write(pickled) 
      # writePickleFile('model', mlmodel)
      

  # ############################### PICKLE ############################### #

  def writePickleFile(pkl_name, pkl_obj):
    with open(modelDataFolder + pkl_name + '.pkl', 'wb') as f:
      pickle.dump(pkl_obj, f)

  def writeModelFile(pkl_obj):
    joblib.dump(pkl_obj, modelDataFolder + 'model.pkl')

  # ############################### Y REGION ############################### #

  y_index = 0
  y = df[y_index]
  y_type = df[y_index].dtype

  if(not (y_type == np.float64 or y_type == np.int64)):
    yLabelEncoder = createOrLoadLabelEncoder('yLabelEncoder', y)
    y = yLabelEncoder.transform(y)

  # ############################### X REGION ############################### #

  X = df.drop([y_index], 1)
  X_type = [X[i].dtype for i in X]
  X = X.values

  indices_to_drop = []
  for i in range(len(X_type)):
    if(i in stringFeatures):
      vectorizer = createOrLoadVectorizer('xVectorizer' + str(i), X[:,i])
      X_new = (vectorizer.transform(X[:,i])).todense()
      X = np.column_stack((X, X_new))
      indices_to_drop.append(i)
      continue;
    if(not (X_type[i] == np.float64 or X_type[i] == np.int64)):
      labelEncoder = createOrLoadLabelEncoder('xLabelEncoder' + str(i), X[:,i])
      X[:,i] = labelEncoder.transform(X[:,i])

  for i in indices_to_drop:
    X = np.delete(X, i, 1)

  # ############################### MODEL TRAINING ############################### #

  model = createOrLoadMLModel()
  model.fit(X, y)
  writeModelFile(model)
except Exception as exp:
  post_fields = {'trainingStatus': 'Idle', 'lastTrainingStatus': 'Failed', 'stringFeatures': ','.join(strFeat), 'featuresCount': featuresCount}
  print('failed')
else:
  post_fields = {'trainingStatus': 'Idle', 'lastTrainingStatus': 'Successfully trained', 'stringFeatures': ','.join(strFeat), 'featuresCount': featuresCount}
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