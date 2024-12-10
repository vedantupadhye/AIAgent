const fetchRecommendations = async (question) => {
    try {
      const response = await axios.post("http://localhost:8000/query", { text: question });
      const { recommendations, query, results } = response.data;
  
      console.log("Fetched Recommendations:", recommendations);  // Log recommendations
  
      setRecommendations(recommendations);  // Set recommendations in state
      setSqlQuery(query);
      setResults(results);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };
  