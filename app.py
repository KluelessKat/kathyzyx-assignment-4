from flask import Flask, render_template, request, jsonify
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords')

app = Flask(__name__)


# TODO: Fetch dataset, initialize vectorizer and LSA here
newsgroups = fetch_20newsgroups(subset='all')
vectorizer = TfidfVectorizer(stop_words='english')
X = vectorizer.fit_transform(newsgroups.data)

# Apply SVD (Latent Semantic Analysis)
svd = TruncatedSVD(n_components=300)  # Reducing dimensionality
X_reduced = svd.fit_transform(X) #term-document matrix in the reduced space (with 100 dimensions)

def search_engine(query):
    """
    Function to search for top 5 similar documents given a query
    Input: query (str)
    Output: documents (list), similarities (list), indices (list)
    """
    # TODO: Implement search engine here
    # return documents, similarities, indices 

    # Transform the query into a vector using the same vectorizer
    query_vector = vectorizer.transform([query])
    query_reduced = svd.transform(query_vector)

    # Compute cosine similarities between the query and all documents
    similarities = cosine_similarity(query_reduced, X_reduced).flatten()
    
    # Get the top 5 documents with the highest cosine similarity
    top_indices = similarities.argsort()[-5:][::-1]
    top_documents = [newsgroups.data[i] for i in top_indices]
    top_similarities = similarities[top_indices]

    return top_indices.tolist(), top_documents, top_similarities.tolist()


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query = request.form['query']
    indices, documents, similarities = search_engine(query)

    # Log the data being returned to the front-end
    print(f"Top Indices: {indices}")
    print(f"Top Similarities: {similarities}")

    return jsonify({'indices': indices, 'documents': documents, 'similarities': similarities }) 

if __name__ == '__main__':
    app.run(debug=True)
