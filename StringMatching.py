import pandas as pd
import re
import unicodedata
import ngram
import time
import json
import sys

# Simple Parsing 
def clean_string(s):
    if not isinstance(s, str):
        return s
    # Convert accents to ascii and uppercase the string - why choose 'ignore'?
    clean = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').upper().decode("utf-8")
    # Remove all non-alphanumeric characters but leave whitespaces
    return re.sub('\s+',' ',re.sub(r'([^\s\w]|_)+','',clean)).strip()
     
def matchAccounts(fileName, company_list):
    startTime = time.time()
    # Read in Lists 
    sfdc_list = pd.read_csv('sfdc_accounts.csv', encoding = 'utf-8')

    company_list['name_parsed'] = company_list['Company'].apply(lambda x: clean_string(x))
    sfdc_list['name_parsed'] = sfdc_list['AccountName'].apply(lambda x: clean_string(x))
    #
    # Simple String Match
    #
    exact_df = pd.merge(company_list, sfdc_list, on=['name_parsed'], how='inner')
    # Write matches to file
    exact_df.to_csv('exact_matched_' + fileName, encoding='utf-8')
    #Remove all exact matches from company_list df
    company_list = company_list[(~company_list.name_parsed.isin(exact_df.name_parsed))]
    #
    # N-Gram Search
    #

    similarity_threshold = 0.7
    # Load up the NGram Search Space
    sfdc_account_list = [i for i in sfdc_list['name_parsed'].tolist() if isinstance(i, str)]
    print('Building Search')
    G = ngram.NGram(sfdc_account_list)
    results = []
    for index, row in company_list.iterrows():    
        if isinstance(row['name_parsed'], str):
            best_match = G.search(row['name_parsed'], threshold=similarity_threshold)
            if len(best_match) > 0:
                first_item = best_match[0]
                match_name = first_item[0]
                score = first_item[1]            
                sfdc_details = sfdc_list[sfdc_list.name_parsed == match_name]
                sfdc_account_name = sfdc_details.iloc[0]['AccountName']
                results.append([row['Company'], row['name_parsed'], sfdc_account_name, score])
            else:
                results.append([row['Company'], row['name_parsed'], '', 0])          

    df = pd.DataFrame(results)
    df.columns = ['Company Name','Parsed Name', 'SFDC Name','Score']
    df = df[df.Score != 0]
    df.to_csv('./ngram_results_' + fileName, encoding='utf-8')
    print('NGram Results Written to Disk')
    print(time.time() - startTime)
#################################
## Preping data to sent to client

# creating a list of lists from the the first item the headers of the dataframe
    
    exact_matches= [list(exact_df)] + exact_df.as_matrix().tolist()
    ngram_results = [list(df)] + df.as_matrix().tolist()
    package = {'exact_matches': exact_matches, 'ngram_results' : ngram_results}

    return package
