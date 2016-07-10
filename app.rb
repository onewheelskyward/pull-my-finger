require 'sinatra/base'
require 'sinatra/config_file'
require 'rest-client'
require 'base64'
require 'json'

class App < Sinatra::Base
  register Sinatra::ConfigFile
  config_file 'config.yml'

  before do
    content_type 'application/json'
  end

  def check_auth(params)
    unless settings.tokens.include? params[:token] and settings.team_domains.include? params[:team_domain]
      puts "Token #{params[:token]} not found in #{settings.tokens} or #{params[:team_domain]} doesn't match #{settings.team_domains}"
      false
    end
    true
  end

  get '/pulls*' do
    halt 400, '{"message": "Auth failed."}' unless check_auth(params)
    responses = []
    puts params[:response_url]

    settings.repos.each do |repo|
      uri = 'https://api.github.com/repos/' + settings.repo_owner + '/' + repo + '/pulls';
      puts 'Calling URI: ' + uri

      # result = RestClient.get uri
      response = RestClient::Request.new(
          :method => :get,
          :url => uri,
          :user => settings.username,
          :password => settings.password,
      ).execute
      result = JSON.parse(response)
      # var str_format = pull.head.repo.name + ': ' + pull.number + ' - ' + pull.title + '\n' + pull.url;
      result.each do |pull|
        str_format = "#{pull['head']['repo']['name']}: #{pull['number']} - #{pull['title']}\n#{pull['html_url']}"
        responses.push str_format
      end
    end

    { response_type: 'in_channel',
      text: responses.join("\n"),
    }.to_json
  end
end
