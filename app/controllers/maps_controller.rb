class MapsController < ApplicationController

  protect_from_forgery :except => [:create, :gamehandler]

  before_filter :authenticate, :only => [:new, :create, :show, :destroy, :gamehandler, :protect_index, :destroy_index]

  def new
  	@title = "Protect"
    
    @mapname = Map.generate_name(session[:id])
  end

  def create
    #this method is only called per AJAX request
    mapname = Map.set_name(params[:mapname], session[:id])
    
    @map = Map.new(:name => mapname, :user_id => session[:id], :content => params[:map], :score => params[:score])
    
    if @map.save
      @user = User.find(@map.user_id)
      @user.createScore += @map.score.to_i
      #score = @user.createScore + @map.score.to_i
      #@user.update_attribute(:createScore,score)
        
      if @user.save
        flash[:success] = "Your map was created successfully"
      end
    else
      flash[:error] = "Failed to save map "
    end
    render 'protect_index'
  end

  def show
  	@map = Map.find(params[:id])
  	@title = "Destroy"
  end

  def destroy
    #@user = User.find(session[:id])
    @map = Map.find(params[:id])
    @user = User.find(@map.user_id)
    @user.createScore -= @map.score

    if @map.destroy
      @user.save
      flash[:success] = "Your map was destroyed"
    end
    redirect_to protect_path
  end

  def gamehandler
  	@map = Map.find(params[:mapid].to_i)
    @destroyer = User.find(session[:id])
    @builder = User.find(@map.user_id)
    
    if(@destroyer.id != @builder.id)
      @destroyer.destroyScore += params[:destroyerscore].to_i    
      @builder.createScore += params[:builderscore].to_i
    end
    if (@builder.save && @destroyer.save)
      flash[:success] = "Destroyer points added"
    end
    
    render :nothing => true, :status => 200;
  end

  def protect_index
  	@title = "Protect"
    @maps = Map.find_all_by_user_id(session[:id])
  end
  
  def destroy_index
  	@title = "Destroy"
    #@rand_maps = Map.paginate(:all, :offset => (Map.count * rand).to_i, :per_page => 2, :page => params[:rand_page] )
    @rand_maps = Map.find(:all, :offset => (Map.count * rand).to_i, :limit => 5);
    
    
    @latest_maps = Map.paginate(:all, :per_page => 5, :order => 'created_at DESC', :page => params[:latest_page])
    
    @user_id = current_user.id
    @my_maps = Map.find_all_by_user_id(@user_id).paginate(:per_page => 5, :order => 'created_at DESC', :page => params[:my_page]);
  end
end

