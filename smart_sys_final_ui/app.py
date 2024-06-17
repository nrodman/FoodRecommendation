from flask import Flask, render_template, jsonify, request
import pandas as pd
import random
import json
import numpy as np
app = Flask(__name__)

recipes_df = pd.read_csv('./data/our12recipes.csv')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/random_recipes')
def random_recipes():
    random_recipes = recipes_df.sample(6).to_dict(orient='records')
    return jsonify(random_recipes)

# back to here
@app.route('/generate_recommendations', methods=['POST'])
def generate_recommendations():
    try:
        selected_recipe_id = request.json['recipeid']
        with open('data/recommendations.json', 'r') as f:
            recommendations = json.load(f)
        selected_recommendations = recommendations.get(selected_recipe_id, {
            "item_recommendations": [],
            "user_recommendations": []
        })
        return jsonify(selected_recommendations)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)

