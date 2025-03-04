# from dotenv import load_dotenv
# load_dotenv()

# import streamlit as st
# import os
# import sqlite3
# import google.generativeai as genai

# # API key
# genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
# st.set_page_config(page_title="SQL Query Generator", page_icon="📊")

# # Header and description
# st.header("🔍 Smart Agent for Natural Language to SQL query")


# # Initialize session state for storing inputs and results
# if "user_inputs" not in st.session_state:
#     st.session_state.user_inputs = {}

# if "show_confirmation" not in st.session_state:
#     st.session_state.show_confirmation = False

# if "show_error_message" not in st.session_state:
#     st.session_state.show_error_message = False

# # Synonyms for column names
# column_synonyms = {
#     "slab": ["input material", "raw material"],
#     "slab weight": ["input weight", "raw material weight"],
#     "coil": ["product", "production", "output material"],
#     "steel grade": ["steel grade", "coil grade", "material grade", "tdc grade"],
#     "coil thickness": ["output material thickness", "product thickness", "production thickness"],
#     "coil width": ["output material width", "product width", "production width"],
#     "Coil weight": ["output material weight", "product weight", "production weight"],
#     "target coil thickness": ["order thickness", "target thickness", "tdc thickness"],
#     "Target coil width": ["order width", "target width", "tdc width"],
#     "production time": ["line running time", "running time"],
#     "idle time": ["available time", "total available time"],
#     "running time percentage": ["running time %", "running time percentage"],
#     "idle time percentage": ["idle time %", "idle time percentage"],
#     "shift a": ["shift A", "06:00:00 to 13:59:59"],
#     "shift b": ["shift B", "14:00:00 to 21:59:59"],
#     "shift c": ["shift C", "22:00:00 to 05:59:59"]
# }

# # Function to check for the best matching synonym in the user question

# def check_for_synonyms(question):
#     best_match = None
#     best_match_length = 0
    
#     # Lowercase the question to make matching case-insensitive
#     question_lower = question.lower()
    
#     # Iterate through the column synonyms
#     for column, synonyms in column_synonyms.items():
#         for synonym in synonyms:
#             synonym_lower = synonym.lower()
#            
#             if synonym_lower in question_lower and len(synonym_lower) > best_match_length:
#                 best_match = column
#                 best_match_length = len(synonym_lower)
                
#     return best_match


# prompt = [
#     '''
#      You are an expert in converting English questions to SQL queries! The SQL database contains a table named RESULT with the following columns:

# - DATEE: Date & time of creation of the slab or coil.
# - DATESE: Staring Date & Time of Creation of slab or coil . 
# - SCHNO: Schedule number.
# - SEQ: Rolling sequence number of the slab.
# - SLAB: Slab ID, also referred to as 'Input Material' or 'Raw Material'.
# - S_WEIGHT: Slab weight, also called 'Input Weight' or 'Raw Material Weight'.
# - COIL: Coil ID, also referred to as 'Output Material', 'Product', or 'Production'.
# - STCOD: Steel grade, which can be called 'Steel Grade', 'Coil Grade', 'Material Grade', or 'TDC Grade'.
# - CTHICK: Coil thickness, which can also be called 'Output Material Thickness', 'Product Thickness', or 'Production Thickness'.
# - CWIDTH: Coil width, referred to as 'Output Material Width', 'Product Width', or 'Production Width'.
# - AWEIT: Coil weight, also called 'Output Material Weight', 'Product Weight', or 'Production Weight'.
# - OTHICK: Target coil thickness, referred to as 'Order Thickness', 'Target Thickness', or 'TDC Thickness'.
# - OWIDTH: Target coil width, referred to as 'Order Width', 'Target Width', or 'TDC Width'.
# - SHIFT: Shift A: 06:00:00 to 13:59:59 Shift B: 14:00:00 to 21:59:59 Shift C: 22:00:00 to 05:59:59 (next day)
# - STIME: Stoppage time refers to the time resulting into stoppage of the manifacturing.
# - Production time refers to the time taken for production of a coil i.e.  time of creation of the slab or coil - Staring Date & Time of Creation of slab or coil - or  DATEE - DATESE
# - Production time =  ( DATEE - DATESE) it should always be in minutes

# Additional concepts:
# 1. Line Running Time / Running Time = sum of Production time for all coils in a given period (day or shift)
# 2. Idle Time = Total available time - Line Running Time
# 3. Running Time Percentage (%) = (Line Running Time / Total available time) * 100
# 4. Idle Time Percentage (%) = (Idle Time / Total available time) * 100
# 5. Total Production time (the sum) is the same as line running time 


# IMPORTANT:
# Do not include any markdown formatting, code block indicators (like ```), or the word 'sql' in your response.
# Provide only the SQL query text, without any additional explanations or comments.
# Ensure the query is syntactically correct and ready for direct execution in an SQL environment.


#    The day cycle starts from 6 AM to 6 AM the following day. Each day will consist of three shifts:
# - **Shift A**: Runs from 06:00 AM to 01:59 PM (13:59:59).
# - **Shift B**: Runs from 02:00 PM to 09:59 PM (21:59:59).
# - **Shift C**: Runs from 10:00 PM to 05:59 AM the next day.

# For example:
# - For **24 September**, the day starts from **06:00 AM** and ends at **05:59 AM** on **25 September**.
# - For **25 September**, the day starts from **06:01 AM** and ends at **05:59 AM** on **26 September**.
# When a coil is produced between 12:00 AM and 6:00 AM, but falls under the C shift of the previous day, it should be recorded as produced on the prior day. 
# For example, if a coil is produced at 02:00 AM on 30/09/2024, it should be considered as produced on 29/09/2024, 
# as it falls within the C shift of 29/09/2024. The day cycle runs from 6:00 AM to 6:00 AM, so any coil produced before 6:00 AM 
# on the following day still belongs to the previous day's shift.
# When handling dates, you should convert normal date formats (like "24 September 2024") into the SQL format "YYYY-MM-DD HH:MM".


# 1. Calculate the average production time per day:
# SQL:
# SELECT 
#     DATE(DATESE) AS ProductionDate,
#     ROUND(AVG((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS AvgProductionTimeInMinutes
# FROM RESULT
# GROUP BY DATE(DATESE);

# SELECT 
#     CASE 
#         WHEN TIME(DATESE) BETWEEN '06:00:00' AND '13:59:59' THEN 'A'
#         WHEN TIME(DATESE) BETWEEN '14:00:00' AND '21:59:59' THEN 'B'
#         ELSE 'C'
#     END AS Shift,
#     ROUND(AVG((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS AvgProductionTimeInMinutes
# FROM RESULT
# WHERE TIME(DATEE) >= TIME(DATESE)
# GROUP BY Shift;


# 3. Calculate the total production time per shift:
# SQL:
# SELECT 
#     CASE 
#         WHEN TIME(DATESE) BETWEEN '06:00:00' AND '13:59:59' THEN 'A'
#         WHEN TIME(DATESE) BETWEEN '14:00:00' AND '21:59:59' THEN 'B'
#         ELSE 'C'
#     END AS Shift,
#     ROUND(SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS TotalProductionTimeInMinutes
# FROM RESULT
# WHERE TIME(DATEE) >= TIME(DATESE)
# GROUP BY Shift;

# 4. Find the maximum and minimum production times:
# SQL:
# SELECT 
#     COIL,
#     ROUND(MAX((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS MaxProductionTimeInMinutes,
#     ROUND(MIN((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS MinProductionTimeInMinutes
# FROM RESULT
# GROUP BY COIL;


# ------------------------------------------------
# 5. Average Production Time per Day
# SELECT 
#     DATE(DATESE, '-6 hours') AS ProductionDate,
#     ROUND(AVG((JULIANDAY(MIN(DATEE, DATETIME(DATE(DATESE, '+1 day'), '06:00:00'))) - JULIANDAY(MAX(DATESE, DATETIME(DATE(DATESE), '06:00:00')))) * 24 * 60), 2) AS AvgProductionTimeInMinutes
# FROM 
#     RESULT
# WHERE 
#     (DATETIME(DATESE) >= DATETIME(DATE(DATESE), '06:00:00') AND DATETIME(DATEE) <= DATETIME(DATE(DATESE, '+1 day'), '06:00:00'))
#     OR (DATETIME(DATESE) < DATETIME(DATE(DATESE), '+1 day', '06:00:00') AND DATETIME(DATEE) > DATETIME(DATE(DATESE), '06:00:00'))
# GROUP BY 
#     DATE(DATESE, '-6 hours');


# 6. Average production time for "date"

# SELECT 
#     '2024-09-29' AS ProductionDate,  -- Replace '2024-09-29' with your specific date
#     ROUND(
#         AVG(
#             (JULIANDAY(MIN(DATEE, '2024-09-30 06:00:00')) - JULIANDAY(MAX(DATESE, '2024-09-29 06:00:00'))) * 1440
#         ), 2
#     ) AS AvgProductionTimeInMinutes
# FROM 
#     RESULT
# WHERE 
#     (DATETIME(DATESE) >= '2024-09-29 06:00:00' AND DATETIME(DATEE) <= '2024-09-30 06:00:00')
#     OR (DATETIME(DATESE) < '2024-09-30 06:00:00' AND DATETIME(DATEE) > '2024-09-29 06:00:00');

# 7. Average production time between dates.

# SQL Query:
# SELECT 
#     ROUND(SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS TotalProductionTimeInMinutes,
#     COUNT(*) AS NumberOfCoilsProduced,
#     ROUND(SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440) / COUNT(*), 2) AS AverageProductionTimeInMinutes
# FROM RESULT
# WHERE DATESE >= '2024-09-27 06:00:00' 
#   AND DATESE < '2024-09-30 06:00:00';

# 8. what is the total production time for E350Br 
#  SELECT 
#     ROUND(SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS TotalProductionTimeInMinutes
# FROM RESULT
# WHERE STCOD = 'E350Br';


# NOTE : if asked about Line Running Time for a particular date or Line Running Time Percentage for a particular date then always take date from 6 am to next day 6 am 

# example - 

# SELECT   
#     '2024-09-26' AS ProductionDate,              -- Replace '2024-09-26' with your specific date
#     ROUND(
#         SUM(
#             (JULIANDAY(MIN(DATEE, '2024-09-27 06:00:00')) - JULIANDAY(MAX(DATESE, '2024-09-26 06:00:00'))) * 1440
#         ), 2
#     ) AS LineRunningTimeMinutes
# FROM 
#     RESULT
# WHERE 
#     (DATETIME(DATESE) >= '2024-09-26 06:00:00' AND DATETIME(DATEE) <= '2024-09-27 06:00:00')
#     OR (DATETIME(DATESE) < '2024-09-27 06:00:00' AND DATETIME(DATEE) > '2024-09-26 06:00:00');



# 2. Running Time Percentage/Line Running time Percentage for a day 

# SELECT 
#     '2024-09-29' AS ProductionDate,                                -- Replace '2024-09-29' with the specific date
#     ROUND(
#         (SUM(
#             (JULIANDAY(MIN(DATEE, '2024-09-30 06:00:00')) - JULIANDAY(MAX(DATESE, '2024-09-29 06:00:00'))) * 1440
#         ) / 1440) * 100, 2
#     ) AS RunningTimePercentage
# FROM 
#     RESULT
# WHERE 
#     (DATETIME(DATESE) >= '2024-09-29 06:00:00' AND DATETIME(DATEE) <= '2024-09-30 06:00:00')
#     OR (DATETIME(DATESE) < '2024-09-30 06:00:00' AND DATETIME(DATEE) > '2024-09-29 06:00:00');


# 3. Idle Time (Daily)
# SELECT 
#     DATE(DATESE, '-6 hours') AS ProductionDate,
#     ROUND(1440 - SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS IdleTimeMinutes
# FROM RESULT
# WHERE TIME(DATESE) >= '06:00:00'
#   OR TIME(DATEE) < '06:00:00'
# GROUP BY DATE(DATESE, '-6 hours');


    
# 4. Idle Time Percentage (Daily)
# SELECT 
#     DATE(DATESE, '-6 hours') AS ProductionDate,
#     ROUND(((1440 - SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440)) / 1440) * 100, 2) AS IdleTimePercentage
# FROM RESULT
# WHERE TIME(DATESE) >= '06:00:00'
#   OR TIME(DATEE) < '06:00:00'
# GROUP BY DATE(DATESE, '-6 hours');


# -- Shift-wise Metrics

# 1. Line Running Time (Shift-wise)
# SELECT 
#     CASE 
#         WHEN TIME(DATESE) BETWEEN '06:00:00' AND '13:59:59' THEN 'A'
#         WHEN TIME(DATESE) BETWEEN '14:00:00' AND '21:59:59' THEN 'B'
#         ELSE 'C'
#     END AS Shift,
#     ROUND(SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS LineRunningTimeMinutes
# FROM RESULT
# GROUP BY Shift;

# 2. Idle Time (Shift-wise)
# SELECT 
#     CASE 
#         WHEN TIME(DATESE) BETWEEN '06:00:00' AND '13:59:59' THEN 'A'
#         WHEN TIME(DATESE) BETWEEN '14:00:00' AND '21:59:59' THEN 'B'
#         ELSE 'C'
#     END AS Shift,
#     ROUND(480 - SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS IdleTimeMinutes
# FROM RESULT
# GROUP BY Shift;

# 3.Line Running Time Percentage for Shifts A and B for 28 sept 

# SELECT 
#     CASE 
#         WHEN TIME(DATESE) BETWEEN '06:00:00' AND '13:59:59' THEN 'A'
#         WHEN TIME(DATESE) BETWEEN '14:00:00' AND '21:59:59' THEN 'B'
#     END AS Shift,
#     ROUND((SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440) / 480) * 100, 2) AS LineRunningTimePercentage
# FROM RESULT
# WHERE DATE(DATESE) = '2024-09-28' 
# GROUP BY Shift;


# 4.Line Running Time Percentage for Shift C for 28 sept 
# SELECT 
#     'C' AS Shift,
#     ROUND((SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440) / 480) * 100, 2) AS LineRunningTimePercentage  
# FROM RESULT
# WHERE (DATE(DATESE) = '2024-09-28' AND TIME(DATESE) >= '22:00:00')
#    OR (DATE(DATESE) = '2024-09-29' AND TIME(DATESE) < '06:00:00');

# 5. Idle Time Percentage for Shifts A and B:
# SELECT 
#     CASE 
#         WHEN TIME(DATESE) BETWEEN '06:00:00' AND '13:59:59' THEN 'A'
#         WHEN TIME(DATESE) BETWEEN '14:00:00' AND '21:59:59' THEN 'B'
#     END AS Shift,
#     ROUND(((1440 - SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440)) / 960) * 100, 2) AS IdleTimePercentage
# FROM RESULT
# WHERE DATE(DATESE) = '2024-09-28'  -- specify the date
# AND TIME(DATESE) BETWEEN '06:00:00' AND '21:59:59'
# GROUP BY Shift;
   

# 6.Idle Time Percentage for Shift C (10:00 PM to 6:00 AM next day):
# SELECT 
#     'C' AS Shift,
#     ROUND(((480 - SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440)) / 480) * 100, 2) AS IdleTimePercentage  -- 480 minutes = 8 hours (10 PM to 6 AM)
# FROM RESULT
# WHERE (DATE(DATESE) = '2024-09-28' AND TIME(DATESE) >= '22:00:00')
#    OR (DATE(DATESE) = '2024-09-29' AND TIME(DATESE) < '06:00:00');

   
# 7. Running time  percentage  on 25 sept for  A shift 
# SELECT 
#     'A' AS Shift,
#     ROUND((SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440) / 480) * 100, 2) AS RunningTimePercentage
# FROM RESULT
# WHERE DATE(DATESE) = '2024-09-25'
# AND TIME(DATESE) BETWEEN '06:00:00' AND '13:59:59';


# Question : how many coils were produced on 29 sept;
# SQL :
# SELECT COUNT(*) AS CoilCount 
# FROM RESULT 
# WHERE DATEE >= '2024-09-29 06:00:00' 
#   AND DATEE < '2024-09-30 05:59:59';

# Supported Operations:

# Difference Calculation: Calculate the difference between the maximum and minimum values (e.g., coil weight difference).
# Calculate yield as (AWEIT * 100 / S_WEIGHT), presented as a percentage up to 3 decimal places.
# Yield = (AWEIT * 100 / S_WEIGHT), where AWEIT is the output weight and S_WEIGHT is the input weight.
# The yield must always be a decimal up to 3 decimal places.
# Good yield is defined as yield ≥ 97.000%, and bad yield is < 97.000%.
# If asked about the yield of a shift or day, calculate the yield for each coil first, then sum them and 
# divide by the total number of coils to get the average yield.

# Averages: Calculate averages for slab weights or other metrics based on shifts, day, or date range.
# Sum & Count: Sum or count records based on shifts, steel grade, or date range.
# List: Retrieve records filtered by coil, slab, or steel grade.
# Shift-based Queries: Production statistics filtered by shifts A, B, or C.
    
# Convert the following question into an SQL query:

# {user_question}

# Instructions:
# - Use the **RESULT** table for all queries.
# -Generate the query without adding any formatting symbols or SQL code blocks like ```sql.
# -The query should be in plain SQL format.
# - Convert date formats like "24 September 2024" to 'YYYY-MM-DD HH:MM:SS'.
# - For shifts: 
#   -**Shift A** is 06:00:00 to 13:59:59 on the same day.
#   - **Shift B** is 14:00:00 to 21:59:59 on the same day.
#   - **Shift C** is 22:00:00 of the current day to 05:59:59 of the next day.

# - If asked about Tons, then calculate the sum of AWEIT. While giving answer , convert it into Tons ( 1 ton = 1000KG )
#     - Tons per day refers to the sum of AWEIT for the whole day.
#     - Tons per hour refers to AWEIT / number of hours.
# -If the question involves Yield, use the formula: Yield = (AWEIT * 100 / S_WEIGHT).
# -For yield calculations in SQLite, use the printf function to ensure the final result is always displayed with 3 decimal places, including trailing zeros if necessary.
# -Use the following format:
#  printf('%.3f', ROUND((AWEIT * 100.0 / S_WEIGHT), 3)) AS Yield

# -When comparing yields:
#     Good yield: Yield >= 97.000
#     Bad yield: Yield < 97.000


# Example for calculating yield on a specific date:
# SELECT printf('%.3f', AVG((AWEIT * 100.0 / S_WEIGHT))) AS AverageYield
# FROM RESULT
# WHERE DATE(DATEE) = '2024-09-27';

# For shift-based yield queries:
# 1. Use CASE statements to determine the shift based on the time part of DATEE.
# 2. Calculate the yield directly in the WHERE clause.
# 3. For date-specific queries, use DATE(DATEE) to compare only the date part.

# Example for shift-based good yield count:
# SELECT COUNT(*) AS GoodYieldCount
# FROM RESULT
# WHERE (CASE 
#     WHEN strftime('%H:%M:%S', DATEE) BETWEEN '06:00:00' AND '13:59:59' THEN 'A'
#     WHEN strftime('%H:%M:%S', DATEE) BETWEEN '14:00:00' AND '21:59:59' THEN 'B'
#     WHEN strftime('%H:%M:%S', DATEE) >= '22:00:00' OR strftime('%H:%M:%S', DATEE) < '06:00:00' THEN 'C'
# END) = 'C'
# AND (AWEIT * 100.0 / S_WEIGHT) >= 97.000;

# Example for shift-based good yield count on a specific date:
# SELECT COUNT(*) AS GoodYieldCount
# FROM RESULT
# WHERE DATE(DATEE) = '2024-09-27'
# AND (CASE 
#     WHEN strftime('%H:%M:%S', DATEE) BETWEEN '06:00:00' AND '13:59:59' THEN 'A'
#     WHEN strftime('%H:%M:%S', DATEE) BETWEEN '14:00:00' AND '21:59:59' THEN 'B'
#     WHEN strftime('%H:%M:%S', DATEE) >= '22:00:00' OR strftime('%H:%M:%S', DATEE) < '06:00:00' THEN 'C'
# END) = 'A'
# AND (AWEIT * 100.0 / S_WEIGHT) >= 97.000;

# Note: When filtering by shift, always use the CASE statement to determine the shift based on DATEE, rather than relying on a SHIFT column.
# For average yield over a shift or day, first calculate the yield for each coil, then sum the individual yields and divide by the total number of coils.
# - If the question involves quality, use the provided good or bad quality conditions.
# - Ensure proper date filtering when relevant (e.g., for day or week queries).
# - Provide counts, averages, or sums as requested.
# - For any averages, round the result to 2 decimal places.     
# - For good quality:
#     - CTHICK is within +/- 0.013 of OTHICK.
#     - CWIDTH is within +13 of OWIDTH.
# -Provide a valid SQL query without any syntax errors.   
# For **grade-wise production**, group the data by the **steel grade (STCOD)** and by **date**.
# Use `DATE(DATEE)` to extract the date from the `DATEE` column.
# Generate the query without adding any formatting symbols or SQL code blocks like ```sql.
# The query should be in plain SQL format.

# - If calculating the yield for 26 September, calculate the yield for each coil produced on that date, and then divide the sum of the yields by the number of coils to get the average yield.

# Let the number of coils = 4, then:
# `(yield of coil1 + yield of coil2 + yield of coil3 + yield of coil4) / 4`


# Question : how many coils were produced on 27 sept
# SQL :
# SELECT COUNT(*) AS CoilCount 
# FROM RESULT 
# WHERE DATEE >= '2024-09-27 06:00:00' 
#   AND DATEE < '2024-09-28 05:59:59';

# Question:  "Grade-wise production for each day":
# SQL : 
# SELECT STCOD, DATE(DATEE) AS ProductionDate, COUNT(*) AS CoilCount
# FROM RESULT
# GROUP BY STCOD, DATE(DATEE);

# Question: "What is the difference between the least weighted coil and the most weighted coil on 28 September 2024"
# SQL :
# SELECT MAX(AWEIT) - MIN(AWEIT) AS WeightDifference 
# FROM RESULT 
# WHERE DATE(DATEE) = '2024-09-28';


# Question: "average coil production per day" 
# SQL : 
# SELECT ROUND(AVG(CoilCount), 2) AS AverageDailyCoilProduction
# FROM (
#   SELECT COUNT(*) AS CoilCount
#   FROM RESULT
#   GROUP BY DATE(DATEE)
# ) AS DailyCoilCounts;

# Question: "How many coils were produced in Shift C on 30 September 2024?"
# SQL:
#     SELECT COUNT(*) AS CoilCount 
#     FROM RESULT 
#     WHERE SHIFT = 'C' 
#     AND (DATEE BETWEEN '2024-09-30 21:00:00' AND '2024-10-01 05:59:59');

    
# Question: "How many good quality coils were produced in Shift C on 25 September 2024?"
# SQL:
#     SELECT COUNT(*) AS GoodQualityCount 
#     FROM RESULT 
#     WHERE (ABS(CTHICK - OTHICK) <= 0.013) 
#     AND (CWIDTH >= OWIDTH - 13 AND CWIDTH <= OWIDTH + 13) 
#     AND SHIFT = 'C' 
#     AND (DATEE BETWEEN '2024-09-25 21:00:00' AND '2024-09-26 05:59:59');

    
# Question: "What is the average slab weight produced in Shift 'A'?"
# SQL:   
#     SELECT AVG(S_WEIGHT) AS AverageSlabWeight 
#     FROM RESULT 
#     WHERE SHIFT = 'A';

# Question: "How many bad quality coils were produced in Shift 'B'?"  
# SQL:    
#     SELECT COUNT(*) AS BadQualityCount 
#     FROM RESULT 
#     WHERE (ABS(CTHICK - OTHICK) > 0.013 OR CWIDTH < OWIDTH - 13 OR CWIDTH > OWIDTH + 13) 
#     AND SHIFT = 'B';

# Question: "What is the yield for steel grade E250Br on 24 September 2024?"
# SQL:   
#     SELECT ROUND(SUM(AWEIT) / SUM(S_WEIGHT), 2) AS Yield 
#     FROM RESULT 
#     WHERE STCOD = 'E250Br' 
#     AND DATEE BETWEEN '2024-09-24 00:00:00' AND '2024-09-24 23:59:59';

# Question: **How many records are present?**
#    SQL command: SELECT COUNT(*) FROM RESULT;

# Question: **Show all coils with steel grade 'E250Br'.**
#    SQL command: SELECT * FROM RESULT WHERE STCOD='E250Br';

# Question: **List all products where the width is greater than 1200.**
#    SQL command: SELECT * FROM RESULT WHERE CWIDTH > 1200;

# Question: ** How many coils were produced in the last 2 days**
#    SQL command :
#    SELECT COUNT(*) FROM RESULT WHERE DATEE BETWEEN datetime('now', '-2 days') AND datetime('now');


   
# Make sure to provide an SQL query without including '
# ' or the word 'sql' in the output.    
    
#     '''
# ]

# import sqlite3

# # Load Gemini model and provide SQL query as response

# def get_gemini_response(question, prompt):
#     model = genai.GenerativeModel('gemini-pro')
#     response = model.generate_content([prompt[0], question])
#     return response.text

# # Retrieve query from the database
# def read_sql_query(sql, db):
#     conn = sqlite3.connect(db)
#     cur = conn.cursor()
#     cur.execute(sql)
#     rows = cur.fetchall()
#     conn.commit()
#     conn.close()
#     return rows

# # Function to handle query execution
# def execute_query(question, output_container):
#     # Generate SQL query
#     sql_query = get_gemini_response(question, prompt)
    
#     # Display the generated SQL query in the specified container
#     with output_container:
#         st.subheader("Generated SQL Query:")
#         st.code(sql_query, language="sql")
        
#         # Execute the SQL query
#         try:
#             data = read_sql_query(sql_query, "results.db")
#             st.subheader("The Response is:")
            
#             if data:
#                 for row in data:
#                     st.write(row)
#             else:
#                 st.write("No data found for the query.")
                
#         except Exception as e:
#             st.error(f"An error occurred: {e}")

# # Function to handle Yes button click
# def on_yes_click(output_container):
#     st.session_state.show_confirmation = False
#     st.session_state.show_error_message = False
#     execute_query(st.session_state.current_question, output_container)

# # Function to handle No button click
# def on_no_click():
#     st.session_state.show_confirmation = False
#     st.session_state.show_error_message = True

# # Streamlit App
# question = st.text_input("Input your question: ", key="input")
# submit = st.button("Ask the question")

# # Create an output container for the query result
# output_container = st.container()

# # If submit is clicked
# if submit:
#     st.session_state.current_question = question
#     # Check for synonym in the question
#     synonym_match = check_for_synonyms(question)
    
#     if synonym_match:
#         st.session_state.show_confirmation = True
#         st.write(f"Do you mean '{synonym_match}'?")
        
#         col1, col2 = st.columns(2)
#         with col1:
#             st.button("Yes", on_click=on_yes_click, args=(output_container,), key="yes_button")
#         with col2:
#             st.button("No", on_click=on_no_click, key="no_button")
            
#     else:
#         execute_query(question, output_container)

# # Show error message if No was clicked
# if st.session_state.show_error_message:
#     with output_container:
#         st.error("Please input a valid query")





# # fastAPI WITH NEXTJS

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import sqlite3
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))


app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    text: str

prompt = [
    '''
     You are an expert in converting English questions to SQL queries! The SQL database contains a table named RESULT with the following columns:

- DATEE: Date & time of creation of the slab or coil.
- DATESE: Staring Date & Time of Creation of slab or coil . 
- SCHNO: Schedule number.
- SEQ: Rolling sequence number of the slab.
- SLAB: Slab ID, also referred to as 'Input Material' or 'Raw Material'.
- S_WEIGHT: Slab weight, also called 'Input Weight' or 'Raw Material Weight'.
- COIL: Coil ID, also referred to as 'Output Material', 'Product', or 'Production'.
- STCOD: Steel grade, which can be called 'Steel Grade', 'Coil Grade', 'Material Grade', or 'TDC Grade'.
- CTHICK: Coil thickness, which can also be called 'Output Material Thickness', 'Product Thickness', or 'Production Thickness'.
- CWIDTH: Coil width, referred to as 'Output Material Width', 'Product Width', or 'Production Width'.
- AWEIT: Coil weight, also called 'Output Material Weight', 'Product Weight', or 'Production Weight'.
- OTHICK: Target coil thickness, referred to as 'Order Thickness', 'Target Thickness', or 'TDC Thickness'.
- OWIDTH: Target coil width, referred to as 'Order Width', 'Target Width', or 'TDC Width'.
- SHIFT: Shift A: 06:00:00 to 13:59:59 Shift B: 14:00:00 to 21:59:59 Shift C: 22:00:00 to 05:59:59 (next day)
- STIME: Stoppage time refers to the time resulting into stoppage of the manifacturing.
- Production time refers to the time taken for production of a coil i.e.  time of creation of the slab or coil - Staring Date & Time of Creation of slab or coil - or  DATEE - DATESE
- Production time =  ( DATEE - DATESE) it should always be in minutes

Additional concepts:
1. Line Running Time / Running Time = sum of Production time for all coils in a given period (day or shift)
2. Idle Time = Total available time - Line Running Time
3. Running Time Percentage (%) = (Line Running Time / Total available time) * 100
4. Idle Time Percentage (%) = (Idle Time / Total available time) * 100
5. Total Production time (the sum) is the same as line running time 


IMPORTANT:
Do not include any markdown formatting, code block indicators (like ```), or the word 'sql' in your response.
Provide only the SQL query text, without any additional explanations or comments.
Ensure the query is syntactically correct and ready for direct execution in an SQL environment.
   The day cycle starts from 6 AM to 6 AM the following day. Each day will consist of three shifts:
- **Shift A**: Runs from 06:00 AM to 01:59 PM (13:59:59).
- **Shift B**: Runs from 02:00 PM to 09:59 PM (21:59:59).
- **Shift C**: Runs from 10:00 PM to 05:59 AM the next day.

For example:
- For **24 September**, the day starts from **06:00 AM** and ends at **05:59 AM** on **25 September**.
- For **25 September**, the day starts from **06:01 AM** and ends at **05:59 AM** on **26 September**.
When a coil is produced between 12:00 AM and 6:00 AM, but falls under the C shift of the previous day, it should be recorded as produced on the prior day. 
For example, if a coil is produced at 02:00 AM on 30/09/2024, it should be considered as produced on 29/09/2024, 
as it falls within the C shift of 29/09/2024. The day cycle runs from 6:00 AM to 6:00 AM, so any coil produced before 6:00 AM 
on the following day still belongs to the previous day's shift.
When handling dates, you should convert normal date formats (like "24 September 2024") into the SQL format "YYYY-MM-DD HH:MM".


1. Calculate the average production time per day:
SQL:
SELECT 
    DATE(DATESE) AS ProductionDate,
    ROUND(AVG((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS AvgProductionTimeInMinutes
FROM RESULT
GROUP BY DATE(DATESE);

SELECT 
    CASE 
        WHEN TIME(DATESE) BETWEEN '06:00:00' AND '13:59:59' THEN 'A'
        WHEN TIME(DATESE) BETWEEN '14:00:00' AND '21:59:59' THEN 'B'
        ELSE 'C'
    END AS Shift,
    ROUND(AVG((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS AvgProductionTimeInMinutes
FROM RESULT
WHERE TIME(DATEE) >= TIME(DATESE)
GROUP BY Shift;


3. Calculate the total production time per shift:
SQL:
SELECT 
    CASE 
        WHEN TIME(DATESE) BETWEEN '06:00:00' AND '13:59:59' THEN 'A'
        WHEN TIME(DATESE) BETWEEN '14:00:00' AND '21:59:59' THEN 'B'
        ELSE 'C'
    END AS Shift,
    ROUND(SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS TotalProductionTimeInMinutes
FROM RESULT
WHERE TIME(DATEE) >= TIME(DATESE)
GROUP BY Shift;

4. Find the maximum and minimum production times:
SQL:
SELECT 
    COIL,
    ROUND(MAX((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS MaxProductionTimeInMinutes,
    ROUND(MIN((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS MinProductionTimeInMinutes
FROM RESULT
GROUP BY COIL;


------------------------------------------------
5. Average Production Time per Day
SELECT 
    DATE(DATESE, '-6 hours') AS ProductionDate,
    ROUND(AVG((JULIANDAY(MIN(DATEE, DATETIME(DATE(DATESE, '+1 day'), '06:00:00'))) - JULIANDAY(MAX(DATESE, DATETIME(DATE(DATESE), '06:00:00')))) * 24 * 60), 2) AS AvgProductionTimeInMinutes
FROM 
    RESULT
WHERE 
    (DATETIME(DATESE) >= DATETIME(DATE(DATESE), '06:00:00') AND DATETIME(DATEE) <= DATETIME(DATE(DATESE, '+1 day'), '06:00:00'))
    OR (DATETIME(DATESE) < DATETIME(DATE(DATESE), '+1 day', '06:00:00') AND DATETIME(DATEE) > DATETIME(DATE(DATESE), '06:00:00'))
GROUP BY 
    DATE(DATESE, '-6 hours');


6. Average production time for "date"

SELECT 
    '2024-09-29' AS ProductionDate,  -- Replace '2024-09-29' with your specific date
    ROUND(
        AVG(
            (JULIANDAY(MIN(DATEE, '2024-09-30 06:00:00')) - JULIANDAY(MAX(DATESE, '2024-09-29 06:00:00'))) * 1440
        ), 2
    ) AS AvgProductionTimeInMinutes
FROM 
    RESULT
WHERE 
    (DATETIME(DATESE) >= '2024-09-29 06:00:00' AND DATETIME(DATEE) <= '2024-09-30 06:00:00')
    OR (DATETIME(DATESE) < '2024-09-30 06:00:00' AND DATETIME(DATEE) > '2024-09-29 06:00:00');

7. Average production time between dates.

SQL Query:
SELECT 
    ROUND(SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS TotalProductionTimeInMinutes,
    COUNT(*) AS NumberOfCoilsProduced,
    ROUND(SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440) / COUNT(*), 2) AS AverageProductionTimeInMinutes
FROM RESULT
WHERE DATESE >= '2024-09-27 06:00:00' 
  AND DATESE < '2024-09-30 06:00:00';

8. what is the total production time for E350Br 
 SELECT 
    ROUND(SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS TotalProductionTimeInMinutes
FROM RESULT
WHERE STCOD = 'E350Br';


NOTE : if asked about Line Running Time for a particular date or Line Running Time Percentage for a particular date then always take date from 6 am to next day 6 am 

example - 

SELECT   
    '2024-09-26' AS ProductionDate,              -- Replace '2024-09-26' with your specific date
    ROUND(
        SUM(
            (JULIANDAY(MIN(DATEE, '2024-09-27 06:00:00')) - JULIANDAY(MAX(DATESE, '2024-09-26 06:00:00'))) * 1440
        ), 2
    ) AS LineRunningTimeMinutes
FROM 
    RESULT
WHERE 
    (DATETIME(DATESE) >= '2024-09-26 06:00:00' AND DATETIME(DATEE) <= '2024-09-27 06:00:00')
    OR (DATETIME(DATESE) < '2024-09-27 06:00:00' AND DATETIME(DATEE) > '2024-09-26 06:00:00');



2. Running Time Percentage/Line Running time Percentage for a day 

SELECT 
    '2024-09-29' AS ProductionDate,                                -- Replace '2024-09-29' with the specific date
    ROUND(
        (SUM(
            (JULIANDAY(MIN(DATEE, '2024-09-30 06:00:00')) - JULIANDAY(MAX(DATESE, '2024-09-29 06:00:00'))) * 1440
        ) / 1440) * 100, 2
    ) AS RunningTimePercentage
FROM 
    RESULT
WHERE 
    (DATETIME(DATESE) >= '2024-09-29 06:00:00' AND DATETIME(DATEE) <= '2024-09-30 06:00:00')
    OR (DATETIME(DATESE) < '2024-09-30 06:00:00' AND DATETIME(DATEE) > '2024-09-29 06:00:00');


3. Idle Time (Daily)
SELECT 
    DATE(DATESE, '-6 hours') AS ProductionDate,
    ROUND(1440 - SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS IdleTimeMinutes
FROM RESULT
WHERE TIME(DATESE) >= '06:00:00'
  OR TIME(DATEE) < '06:00:00'
GROUP BY DATE(DATESE, '-6 hours');


    
4. Idle Time Percentage (Daily)
SELECT 
    DATE(DATESE, '-6 hours') AS ProductionDate,
    ROUND(((1440 - SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440)) / 1440) * 100, 2) AS IdleTimePercentage
FROM RESULT
WHERE TIME(DATESE) >= '06:00:00'
  OR TIME(DATEE) < '06:00:00'
GROUP BY DATE(DATESE, '-6 hours');


-- Shift-wise Metrics

1. Line Running Time (Shift-wise)
SELECT 
    CASE 
        WHEN TIME(DATESE) BETWEEN '06:00:00' AND '13:59:59' THEN 'A'
        WHEN TIME(DATESE) BETWEEN '14:00:00' AND '21:59:59' THEN 'B'
        ELSE 'C'
    END AS Shift,
    ROUND(SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS LineRunningTimeMinutes
FROM RESULT
GROUP BY Shift;

2. Idle Time (Shift-wise)
SELECT 
    CASE 
        WHEN TIME(DATESE) BETWEEN '06:00:00' AND '13:59:59' THEN 'A'
        WHEN TIME(DATESE) BETWEEN '14:00:00' AND '21:59:59' THEN 'B'
        ELSE 'C'
    END AS Shift,
    ROUND(480 - SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440), 2) AS IdleTimeMinutes
FROM RESULT
GROUP BY Shift;

3.Line Running Time Percentage for Shifts A and B for 28 sept 

SELECT 
    CASE 
        WHEN TIME(DATESE) BETWEEN '06:00:00' AND '13:59:59' THEN 'A'
        WHEN TIME(DATESE) BETWEEN '14:00:00' AND '21:59:59' THEN 'B'
    END AS Shift,
    ROUND((SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440) / 480) * 100, 2) AS LineRunningTimePercentage
FROM RESULT
WHERE DATE(DATESE) = '2024-09-28' 
GROUP BY Shift;


4.Line Running Time Percentage for Shift C for 28 sept 
SELECT 
    'C' AS Shift,
    ROUND((SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440) / 480) * 100, 2) AS LineRunningTimePercentage  
FROM RESULT
WHERE (DATE(DATESE) = '2024-09-28' AND TIME(DATESE) >= '22:00:00')
   OR (DATE(DATESE) = '2024-09-29' AND TIME(DATESE) < '06:00:00');

5. Idle Time Percentage for Shifts A and B:
SELECT 
    CASE 
        WHEN TIME(DATESE) BETWEEN '06:00:00' AND '13:59:59' THEN 'A'
        WHEN TIME(DATESE) BETWEEN '14:00:00' AND '21:59:59' THEN 'B'
    END AS Shift,
    ROUND(((1440 - SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440)) / 960) * 100, 2) AS IdleTimePercentage
FROM RESULT
WHERE DATE(DATESE) = '2024-09-28'  -- specify the date
AND TIME(DATESE) BETWEEN '06:00:00' AND '21:59:59'
GROUP BY Shift;
   

6.Idle Time Percentage for Shift C (10:00 PM to 6:00 AM next day):
SELECT 
    'C' AS Shift,
    ROUND(((480 - SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440)) / 480) * 100, 2) AS IdleTimePercentage  -- 480 minutes = 8 hours (10 PM to 6 AM)
FROM RESULT
WHERE (DATE(DATESE) = '2024-09-28' AND TIME(DATESE) >= '22:00:00')
   OR (DATE(DATESE) = '2024-09-29' AND TIME(DATESE) < '06:00:00');

   
7. Running time  percentage  on 25 sept for  A shift 
SELECT 
    'A' AS Shift,
    ROUND((SUM((JULIANDAY(DATEE) - JULIANDAY(DATESE)) * 1440) / 480) * 100, 2) AS RunningTimePercentage
FROM RESULT
WHERE DATE(DATESE) = '2024-09-25'
AND TIME(DATESE) BETWEEN '06:00:00' AND '13:59:59';


Question : how many coils were produced on 29 sept;
SQL :
SELECT COUNT(*) AS CoilCount 
FROM RESULT 
WHERE DATEE >= '2024-09-29 06:00:00' 
  AND DATEE < '2024-09-30 05:59:59';

Supported Operations:

Difference Calculation: Calculate the difference between the maximum and minimum values (e.g., coil weight difference).
Calculate yield as (AWEIT * 100 / S_WEIGHT), presented as a percentage up to 3 decimal places.
Yield = (AWEIT * 100 / S_WEIGHT), where AWEIT is the output weight and S_WEIGHT is the input weight.
The yield must always be a decimal up to 3 decimal places.
Good yield is defined as yield ≥ 97.000%, and bad yield is < 97.000%.
If asked about the yield of a shift or day, calculate the yield for each coil first, then sum them and 
divide by the total number of coils to get the average yield.

Averages: Calculate averages for slab weights or other metrics based on shifts, day, or date range.
Sum & Count: Sum or count records based on shifts, steel grade, or date range.
List: Retrieve records filtered by coil, slab, or steel grade.
Shift-based Queries: Production statistics filtered by shifts A, B, or C.
    
Convert the following question into an SQL query:

{user_question}

Instructions:
- Use the **RESULT** table for all queries.
-Generate the query without adding any formatting symbols or SQL code blocks like ```sql.
-The query should be in plain SQL format.
- Convert date formats like "24 September 2024" to 'YYYY-MM-DD HH:MM:SS'.
- For shifts: 
  -**Shift A** is 06:00:00 to 13:59:59 on the same day.
  - **Shift B** is 14:00:00 to 21:59:59 on the same day.
  - **Shift C** is 22:00:00 of the current day to 05:59:59 of the next day.

- If asked about Tons, then calculate the sum of AWEIT. While giving answer , convert it into Tons ( 1 ton = 1000KG )
    - Tons per day refers to the sum of AWEIT for the whole day.
    - Tons per hour refers to AWEIT / number of hours.
-If the question involves Yield, use the formula: Yield = (AWEIT * 100 / S_WEIGHT).
-For yield calculations in SQLite, use the printf function to ensure the final result is always displayed with 3 decimal places, including trailing zeros if necessary.
-Use the following format:
 printf('%.3f', ROUND((AWEIT * 100.0 / S_WEIGHT), 3)) AS Yield

-When comparing yields:
    Good yield: Yield >= 97.000
    Bad yield: Yield < 97.000


Example for calculating yield on a specific date:
SELECT printf('%.3f', AVG((AWEIT * 100.0 / S_WEIGHT))) AS AverageYield
FROM RESULT
WHERE DATE(DATEE) = '2024-09-27';

For shift-based yield queries:
1. Use CASE statements to determine the shift based on the time part of DATEE.
2. Calculate the yield directly in the WHERE clause.
3. For date-specific queries, use DATE(DATEE) to compare only the date part.

Example for shift-based good yield count:
SELECT COUNT(*) AS GoodYieldCount
FROM RESULT
WHERE (CASE 
    WHEN strftime('%H:%M:%S', DATEE) BETWEEN '06:00:00' AND '13:59:59' THEN 'A'
    WHEN strftime('%H:%M:%S', DATEE) BETWEEN '14:00:00' AND '21:59:59' THEN 'B'
    WHEN strftime('%H:%M:%S', DATEE) >= '22:00:00' OR strftime('%H:%M:%S', DATEE) < '06:00:00' THEN 'C'
END) = 'C'
AND (AWEIT * 100.0 / S_WEIGHT) >= 97.000;

Example for shift-based good yield count on a specific date:
SELECT COUNT(*) AS GoodYieldCount
FROM RESULT
WHERE DATE(DATEE) = '2024-09-27'
AND (CASE 
    WHEN strftime('%H:%M:%S', DATEE) BETWEEN '06:00:00' AND '13:59:59' THEN 'A'
    WHEN strftime('%H:%M:%S', DATEE) BETWEEN '14:00:00' AND '21:59:59' THEN 'B'
    WHEN strftime('%H:%M:%S', DATEE) >= '22:00:00' OR strftime('%H:%M:%S', DATEE) < '06:00:00' THEN 'C'
END) = 'A'
AND (AWEIT * 100.0 / S_WEIGHT) >= 97.000;

Note: When filtering by shift, always use the CASE statement to determine the shift based on DATEE, rather than relying on a SHIFT column.
For average yield over a shift or day, first calculate the yield for each coil, then sum the individual yields and divide by the total number of coils.
- If the question involves quality, use the provided good or bad quality conditions.
- Ensure proper date filtering when relevant (e.g., for day or week queries).
- Provide counts, averages, or sums as requested.
- For any averages, round the result to 2 decimal places.     
- For good quality:
    - CTHICK is within +/- 0.013 of OTHICK.
    - CWIDTH is within +13 of OWIDTH.
-Provide a valid SQL query without any syntax errors.   
For **grade-wise production**, group the data by the **steel grade (STCOD)** and by **date**.
Use `DATE(DATEE)` to extract the date from the `DATEE` column.
Generate the query without adding any formatting symbols or SQL code blocks like ```sql.
The query should be in plain SQL format.

- If calculating the yield for 26 September, calculate the yield for each coil produced on that date, and then divide the sum of the yields by the number of coils to get the average yield.

Let the number of coils = 4, then:
`(yield of coil1 + yield of coil2 + yield of coil3 + yield of coil4) / 4`


Question : how many coils were produced on 27 sept
SQL :
SELECT COUNT(*) AS CoilCount 
FROM RESULT 
WHERE DATEE >= '2024-09-27 06:00:00' 
  AND DATEE < '2024-09-28 05:59:59';

Question:  "Grade-wise production for each day":
SQL : 
SELECT STCOD, DATE(DATEE) AS ProductionDate, COUNT(*) AS CoilCount
FROM RESULT
GROUP BY STCOD, DATE(DATEE);

Question: "What is the difference between the least weighted coil and the most weighted coil on 28 September 2024"
SQL :
SELECT MAX(AWEIT) - MIN(AWEIT) AS WeightDifference 
FROM RESULT 
WHERE DATE(DATEE) = '2024-09-28';


Question: "average coil production per day" 
SQL : 
SELECT ROUND(AVG(CoilCount), 2) AS AverageDailyCoilProduction
FROM (
  SELECT COUNT(*) AS CoilCount
  FROM RESULT
  GROUP BY DATE(DATEE)
) AS DailyCoilCounts;

Question: "How many coils were produced in Shift C on 30 September 2024?"
SQL:
    SELECT COUNT(*) AS CoilCount 
    FROM RESULT 
    WHERE SHIFT = 'C' 
    AND (DATEE BETWEEN '2024-09-30 21:00:00' AND '2024-10-01 05:59:59');

    
Question: "How many good quality coils were produced in Shift C on 25 September 2024?"
SQL:
    SELECT COUNT(*) AS GoodQualityCount 
    FROM RESULT 
    WHERE (ABS(CTHICK - OTHICK) <= 0.013) 
    AND (CWIDTH >= OWIDTH - 13 AND CWIDTH <= OWIDTH + 13) 
    AND SHIFT = 'C' 
    AND (DATEE BETWEEN '2024-09-25 21:00:00' AND '2024-09-26 05:59:59');

    
Question: "What is the average slab weight produced in Shift 'A'?"
SQL:   
    SELECT AVG(S_WEIGHT) AS AverageSlabWeight 
    FROM RESULT 
    WHERE SHIFT = 'A';

Question: "How many bad quality coils were produced in Shift 'B'?"  
SQL:    
    SELECT COUNT(*) AS BadQualityCount 
    FROM RESULT 
    WHERE (ABS(CTHICK - OTHICK) > 0.013 OR CWIDTH < OWIDTH - 13 OR CWIDTH > OWIDTH + 13) 
    AND SHIFT = 'B';

Question: "What is the yield for steel grade E250Br on 24 September 2024?"
SQL:   
    SELECT ROUND(SUM(AWEIT) / SUM(S_WEIGHT), 2) AS Yield 
    FROM RESULT 
    WHERE STCOD = 'E250Br' 
    AND DATEE BETWEEN '2024-09-24 00:00:00' AND '2024-09-24 23:59:59';

Question: **How many records are present?**
   SQL command: SELECT COUNT(*) FROM RESULT;

Question: **Show all coils with steel grade 'E250Br'.**
   SQL command: SELECT * FROM RESULT WHERE STCOD='E250Br';

Question: **List all products where the width is greater than 1200.**
   SQL command: SELECT * FROM RESULT WHERE CWIDTH > 1200;

Question: ** How many coils were produced in the last 2 days**
   SQL command :
   SELECT COUNT(*) FROM RESULT WHERE DATEE BETWEEN datetime('now', '-2 days') AND datetime('now');


   
Make sure to provide an SQL query without including '
' or the word 'sql' in the output.    
    
    '''
]

column_synonyms = {
    "slab": ["input material", "raw material", "slab"],
    "slab weight": ["slab weight","input weight", "raw material weight"],
    "coil": [ "coil","product", "production", "output material", "Batch", "Hot Coil", "Rolled Coil"],
    "steel grade": ["steel grade","steel grade", "coil grade", "material grade", "tdc grade", "output material grade"],
    "coil thickness": [ "coil thickness","output material thickness", "product thickness", "production thickness", "Batch thickness", "Hot Thickness"],
    "coil width": [ "coil width","output material width", "product width", "production width", "Batch width", "Hot Width"],
    "coil weight": [   "coil weight","output material weight", "product weight", "production weight", "Plant Production", "Hot Metal Produced", "HSM Output", "Rolling Weight", "Hot Rolling Weight"],
    "target coil thickness": ["target coil thickness","order thickness", "target thickness", "tdc thickness", "Modified Thickness"],
    "target coil width": ["target coil width","order width", "target width", "tdc width", "Modified Width"],
    "line running time": ["line running time", "Plant Running running time"],
    "Production duration" : [ "Production duration" ," Coil Running Time", "Time for Production", "Time taken to Produce the coil"],
    "idle time": ["idle time","available time", "total available time"],
    "running time percentage": ["running time percentage","running time %", "running time percentage"],
    "idle time percentage": ["idle time percentage", "idle time %", "idle time percentage"],
    "production Start Time": [ "Production Start Time","Coil Start Time", "Rolling Start Time"],
    "coil Production Time": ["Coil Production Time","Coil End Time", "Rolling End Time", "Time of Production", "Production Time", "Rolling Finish Time", "DC Out Time"],
    "shift a": ["shift A", "06:00:00 to 13:59:59"],
    "shift b": ["shift B", "14:00:00 to 21:59:59"],
    "shift c": ["shift C", "22:00:00 to 05:59:59"]
}


def check_for_synonyms(question):
    best_match = None
    best_match_length = 0
    
    question_lower = question.lower()
    
    for column, synonyms in column_synonyms.items():
        for synonym in synonyms:
            synonym_lower = synonym.lower()
            # checks longest found syn
            if synonym_lower in question_lower and len(synonym_lower) > best_match_length:
                best_match = column
                best_match_length = len(synonym_lower)
                
    return best_match



def get_gemini_response(question):
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content([prompt[0], question])
    return response.text

def read_sql_query(sql, db):
    conn = sqlite3.connect(db)
    cur = conn.cursor()
    cur.execute(sql)
    rows = cur.fetchall()
    conn.commit()
    conn.close()
    return rows

 

@app.post("/query")
async def query(question: Question):
    try:
        
        sql_query = get_gemini_response(question.text)
        synonym = check_for_synonyms(question.text)
        
        # "Do you mean X?"
        do_you_mean = f"Do you mean '{synonym}'?" if synonym else None
        
        # Execute query
        data = read_sql_query(sql_query, "results.db")
        
        return {"query": sql_query, "results": data, "do_you_mean": do_you_mean}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    return {"message": "Welcome to the SQL Query API"}

if __name__ == "__main__":
    
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)







