class SessionsController < ApplicationController
  
  
  def new
  	@title = "Sign in"
	
	
	#FACEBOOK LOGIN ANDRE
	#def facebook_login
        establish_oauth
		if(!@oath)
            @oauth = Koala::Facebook::OAuth.new("115861615151381", '35aba13c7b790d4e41f38feccacbe04a', "http://localhost:3000/")
		end
	
		#if(session[:fb_id])
        #   session[:id] = User.find_by_fbid(@me['id'])
        #    current_user = User.find(session[:id])
		#	redirect_to current_user
        #    return
		#end
		
		#create OAuth helper
		
			
		#if authorization code exists, get access token
		if params[:code]
			@code = params[:code]
			#request and parse token from facebook
			@token = Koala::Facebook::OAuth.new("115861615151381", '35aba13c7b790d4e41f38feccacbe04a', "http://localhost:3000/").get_access_token(@code)
			
			#establish graph API connection
			establish_graph
			
			#query user data from fb
			@me = @graph.get_object("me")
			
			if User.find_by_fbid(@me['id'])
                session[:fb_id] = @me['id']
				flash.now[:notice] = "user logged in."
			else
				# creates new user

				@user = User.new(:fbid => @me['id'], :name => @me['name'], :email => @me['email'], :isFacebook => true, :password =>@me['id'], :password_confirmation =>@me['id'])

				if @user.save
                    session[:fb_id] = @user.fb_id
					flash.now[:success] = "user saved!"
				else
					# unexpected error occured, save failed
					flash.now[:error] = "User save failed due to wrong data"
				end
			end
		end
		if(session[:fb_id])
			session[:id] = User.find_by_fbid(@me['id']).id
            current_user = User.find(session[:id])
			redirect_to current_user
			return
		else
			#flash.now[:error] = "Error: Login failed"
			#render :action => 'new'
		end

end
 
 
 
  def create
	  user = User.authenticate(params[:session][:email], params[:session][:password])
	  
	  if user.nil?
		flash.now[:error] = "Invalid email/password combination."
		@title = "Sign in"
		redirect_to root_path
	  else
		 sign_in user
      	 redirect_to user
	  end

  end
  
  
  def destroy
    sign_out
    redirect_to root_path
  end


end
