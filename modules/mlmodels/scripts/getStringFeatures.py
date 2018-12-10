import pandas as pd
import numpy as np
import sys

csvFile = sys.argv[1]

df = pd.read_csv(csvFile, header=None, quotechar='"', skipinitialspace=True, encoding='utf-8', nrows=1)
X = df.drop([0], 1)
X_type = [X[i].dtype for i in X]

stringFeat = []
stringFeat.append(str(len(X.columns) + 1)) # the number of columns
for i in range(len(X.columns)):
  if(not (X_type[i] == np.float64 or X_type[i] == np.int64)):
    stringFeat.append(str(i))

print(",".join(stringFeat))