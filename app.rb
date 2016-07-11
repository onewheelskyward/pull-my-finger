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
        response = RestClient::Request.new(
            :method => :get,
            :url => 'https://api.github.com/repos/Lululemon/hubq-backend/issues/' + pull['number'].to_s,
            :user => settings.username,
            :password => settings.password,
        ).execute
        issue = JSON.parse(response)

        str_format = "#{pull['head']['repo']['name']}: #{pull['number']} - #{pull['title']}\n#{pull['html_url']}"
        issue['labels'].each do |label|
          str_format += "\n#{label['name']}"
        end
        responses.push str_format
      end
    end

    if responses.empty?
      reply = ['All caught up.', 'Nothing to see here, move along.', "🎉"].sample
    else
      reply = responses.join("\n")
    end

    slack_reply = { response_type: 'in_channel',
                    text: reply
                  }.to_json

    puts "Delayed-replying to #{params[:response_url]}"
    RestClient.post params[:response_url], slack_reply, :content_type => :json
  end
end
